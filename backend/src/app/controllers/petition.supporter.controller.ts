import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import * as v from '../../app/validate';
import * as users from "../models/user.model";
import * as petitions from "../models/petition.model";
import * as petitionST from "../models/petition.support_tier.model";
import * as petitionSupp from "../models/petition.supporter.model";

import {getSupporter} from "../models/petition.support_tier.model";
import {getSupporterTimestamp} from "../models/petition.supporter.model";


function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}
                                        ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return formattedDateTime;
}



const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        const petitionID = parseInt(req.params.id, 10);

        if(isNaN(petitionID)){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        const ownerID = await petitions.getPetition(petitionID);
        if (ownerID.length <= 0){
            res.statusMessage = `Not Found`;
            res.status(404).send();
            return;
        }

        const result = await petitionSupp.getSupporterTimestamp(petitionID);
        res.statusMessage = "OK";
        res.status(200).send(result);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addSupporter = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.support_post,
        req.body);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }


    try{
        const token = req.header("X-Authorization");
        if (token === undefined){
            res.statusMessage = `Unauthorized`;
            res.status(401).send();
            return;
        }

        const petitionID = parseInt(req.params.id, 10);
        const supportTierId = req.body.supportTierId;
        const message = req.body.message;
        const creationDate = getCurrentDateTime();


        if(isNaN(petitionID)){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }


        const user = await users.checkToken(token);
        if (user.length <= 0){
            res.statusMessage = `Unauthorized`;
            res.status(401).send();
            return;
        }
        const userID = user[0].id;
        const ownerID = await petitions.getPetition(petitionID);

        if (ownerID.length <= 0){
            res.statusMessage = `Not Found`;
            res.status(404).send();
            return;
        }

        if(userID === ownerID[0].ownerId) {
            res.statusMessage = `Cannot support your own petition`;
            res.status(403).send();
            return;
        }


        const checkUniSTid = await petitionSupp.getSupporterTimestamp(supportTierId);
        for(const STid of checkUniSTid){
            if (supportTierId === STid.support_tier_id && userID === STid.user_id){
                res.statusMessage = `Already supported at this tier`;
                res.status(403).send();
                return;
            }
        }


        const idExists = await petitionSupp.checkPidSTidExists(petitionID, supportTierId);
        if (!idExists){
            res.statusMessage = "No petition found with id or Support tier does not exist";
            res.status(404).send();
            return;
        }

        const result = await petitionSupp.insertSupporter(petitionID, supportTierId, userID, message, creationDate);
        res.statusMessage = "OK";
        res.status(201).send();


    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}










export {getAllSupportersForPetition, addSupporter}