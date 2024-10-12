import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as users from '../models/user.model';
import * as usersImage from '../models/user.image.model';
import * as schemas from '../resources/schemas.json';
import * as passwords from '../services/passwords';
import * as v from '../../app/validate';
import path from "node:path";
import fs from "mz/fs";


const getImage = async (req: Request, res: Response): Promise<void> => {
    // const token = req.header("X-Authorization");

    try{
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(500).send();
            return
        }

        const result = await users.userID(id);
        if(result.length <= 0){
            res.statusMessage = "Not Found. No user with specified ID";
            res.status(404).send();
            return
        }

        if(result[0].image_filename === null){
            res.statusMessage = "Not Found. User has no image";
            res.status(404).send();
            return
        } else {
            const type = result[0].image_filename.split('.')[1];
            // const filePath = path.join(__dirname, '../../../storage/images', result[0].image_filename);
            res.setHeader('Content-Type', `image/${type}`);
            res.statusMessage = "OK";
            res.status(200).send();
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        const id = parseInt(req.params.id, 10);
        const image = req.body
        const imageType = req.get('Content-Type');

        if (isNaN(id)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(400).send();
            return
        }

        const result = await users.userID(id);
        if(result.length <= 0){
            res.statusMessage = "Not Found. No user with specified ID";
            res.status(404).send();
            return
        }


        if (token === undefined){
            res.statusMessage = "Unauthorized or Invalid currentPassword";
            res.status(401).send();
            return
        }

        if(result[0].auth_token !== token){
            res.statusMessage = "Can not change another user's profile photo";
            res.status(403).send();
            return
        }

        if (!['image/png', 'image/jpeg', 'image/gif'].includes(imageType)) {
            res.status(400).send('Bad Request. Invalid image supplied (possibly incorrect file type)');
            return;
        }

        const idImage = `user_${id}.${imageType.split('/')[1]}`;
        const filePath = path.join(__dirname, '../../../storage/images', idImage);
        await fs.writeFile(filePath, image);


        if (result[0].image_filename === null) {
            await usersImage.updateImage(id, idImage)
            res.statusMessage = "Created. New image created";
            res.status(201).send();

        } else {
            await usersImage.updateImage(id, idImage)
            res.statusMessage = "OK. Image updated";
            res.status(200).send();
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(400).send();
            return
        }

        if (token === undefined){
            res.statusMessage = "Unauthorized or Invalid currentPassword";
            res.status(401).send();
            return
        }

        const result = await users.userID(id);
        if(result.length <= 0){
            res.statusMessage = "Not Found. No user with specified ID";
            res.status(404).send();
            return
        }

        if(result[0].auth_token !== token){
            res.statusMessage = "Can not change another user's profile photo";
            res.status(403).send();
            return
        }

        if (result[0].image_filename !== null) {
            const idImage = result[0].image_filename;
            const filePath = path.join(__dirname, '../../../storage/images', idImage);
            await fs.unlink(filePath);
            await usersImage.deleteImage(id);
            res.statusMessage = "OK";
            res.status(200).send();

        } else {
            res.statusMessage = "Not Found. No image";
            res.status(404).send();
            return
        }


    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}