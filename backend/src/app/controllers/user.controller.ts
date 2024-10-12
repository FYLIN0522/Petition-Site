import * as users from '../models/user.model';
import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as schemas from '../resources/schemas.json';
import * as passwords from '../services/passwords';
import * as v from '../../app/validate';



const register = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST create a user with username: ${req.body.firstName}`)
    const validation = await v.validate(
        schemas.user_register,
        req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const password = await passwords.hash(req.body.password);

        const emailExists = await users.getUser(email);
        // Logger.info('Adding user')
        if (emailExists.length > 0){
            res.statusMessage = 'Forbidden.Email already in use';
            res.status(403).send();
            return
        }


        const result = await users.insert(firstName, lastName, email, password);
        res.status( 201 ).send({"userId": result.insertId} );

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
};


const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Check password for username: ${req.body.firstName}`)
    const validation = await v.validate(
        schemas.user_login,
        req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{

        const email = req.body.email;
        const password = req.body.password;

        const userInfo = await users.getUser(email);
        // Logger.info('Adding user')
        if (userInfo.length <= 0){
            res.statusMessage = 'UnAuthorized. Incorrect email/password';
            res.status(401).send();
            return
        }


        if (!await passwords.compare(password, userInfo[0].password)){
            res.statusMessage = 'UnAuthorized. Incorrect email/password';
            res.status(401).send();
            return
        } else {
            const token = await users.generateToken(email);
            res.statusMessage = "OK, login";
            res.status(200).send({"userId": userInfo[0].id, "token": token});
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const logout = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        if (token == null){
            res.statusMessage = "Unauthorized. Cannot log out if you are not authenticated";
            res.status(401).send();
            return
        }

        const checkTokenExist = await users.checkToken(token);
        if(checkTokenExist.length <= 0){
            res.statusMessage = "Unauthorized. Cannot log out if you are not authenticated";
            res.status(401).send();
            return
        }


        await users.logout(token);
        res.statusMessage = "OK, logout";
        res.status(200).send();
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "OK";
        res.status(500).send();
        return;
    }
}



const view = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        const id = parseInt(req.params.id, 10);
        let userDetails;

        if (isNaN(id)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(400).send();
            return
        }

        const row = await users.userID(id);
        if(row.length <= 0){
            res.statusMessage = "Not Found. No user with specified ID";
            res.status(404).send();
            return
        }


        const result = await users.userID(id);
        if(result[0].auth_token === token){
            userDetails = {
                            'email': result[0].email,
                            'firstName': result[0].first_name,
                            'lastName': result[0].last_name,
                            }
        } else {
            userDetails = {
                            'firstName': result[0].first_name,
                            'lastName': result[0].last_name,
            }
        }
        res.statusMessage = "OK, view";
        res.status(200).send(userDetails);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


// Update a user's information with that specified. Only accessible by the user themselves.
//
// The email must be syntactically valid and not in use as described in /users/register.
//     The password and currentPassword fields can only be supplied when editing the password.
//     The currentPassword must match the users existing password.
//     currentPassword and password must not be the same.
//     currentPassword and password must be at least 6 characters
//     . Note: A subset of values can be supplied in the body (i.e. only changing the email)
const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST create a user with username: ${req.body.firstName}`)
    const validation = await v.validate(
        schemas.user_edit,
        req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(400).send();
            return
        }

        const token = req.header("X-Authorization");
        const oldPassword = req.body.currentPassword;
        let newPassword = req.body.password;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let email = req.body.email;

        const result = await users.userID(id);


        if(result.length <= 0){
            res.statusMessage = "Not Found. No user with specified ID";
            res.status(404).send();
            return
        }


        const matchPassword = await passwords.compare(oldPassword, result[0].password);
        if(!matchPassword){
            res.statusMessage = "Unauthorized or Invalid currentPassword";
            res.status(401).send();
            return
        }

        if(result[0].auth_token !== token){
            res.statusMessage = "Unauthorized or Invalid currentPassword";
            res.status(401).send();
            return
        }

        if(newPassword === oldPassword){
            res.statusMessage = "Identical current and new passwords";
            res.status(403).send();
            return
        }

        if(email !== undefined){
            const checkEmailExists = await users.getUser(email)
            if (checkEmailExists.length > 0){
                res.statusMessage = "Email is already in use";
                res.status(403).send();
                return
            }
        }

        // const params = {id, firstName, lastName, email, newPassword};
        if (firstName === undefined) firstName = result[0].first_name;
        if (lastName === undefined) lastName = result[0].last_name;
        if (email === undefined) email = result[0].email;
        if (newPassword === undefined){
            newPassword = await passwords.hash(oldPassword);
        } else {
            newPassword = await passwords.hash(newPassword);
        }

        await users.userUpdate(id, firstName, lastName, email, newPassword);
        res.statusMessage = "OK, view";
        res.status(200).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}