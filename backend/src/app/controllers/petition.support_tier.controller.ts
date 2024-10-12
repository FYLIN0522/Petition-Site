import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import * as petitions from '../models/petition.model';
import * as petitionST from '../models/petition.support_tier.model';
import * as v from '../../app/validate';
import * as users from "../models/user.model";
import {checkSTitle, getSupporter, getSupportTier} from "../models/petition.support_tier.model";
import {insertST} from "../models/petition.model";
import {ResultSetHeader} from "mysql2";
import {getPool} from "../../config/db";



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



const addSupportTier = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.support_tier_post,
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
        let description = req.body.description;
        const title = req.body.title;
        const cost = req.body.cost;
        const creationDate = getCurrentDateTime();

        if (cost < 0){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
        }

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

        if(userID !== ownerID[0].ownerId) {
            res.statusMessage = `Only the owner of a petition may change it`;
            res.status(403).send();
            return;
        }

        if (title === undefined){
            res.statusMessage = `Bad request`;
            res.status(400).send();
            return;
        }

        const threeIDExists = await petitionST.checkSupportTier(petitionID);
        if (threeIDExists){
            res.statusMessage = `Can add a support tier if 3 already exist`;
            res.status(403).send();
            return;
        }

        const titleExists = await petitionST.checkSTitle(title);
        if(titleExists.length > 0){
            res.statusMessage = `Support title not unique within petition`;
            res.status(403).send();
            return;
        }
        if (description === undefined){
            description = "";
        }

        const result = await petitions.insertST(petitionID, description, title, cost);
        res.statusMessage = "OK";
        res.status(201).send(result);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editSupportTier = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.support_tier_patch,
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
        const supportSTID = parseInt(req.params.tierId, 10);
        let description = req.body.description;
        let title = req.body.title;
        const cost = req.body.cost;
        const creationDate = getCurrentDateTime();

        if (cost < 0){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
        }

        if(isNaN(petitionID)){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        if(isNaN(supportSTID)){
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

        if(userID !== ownerID[0].ownerId) {
            res.statusMessage = `Only the owner of a petition may change it`;
            res.status(403).send();
            return;
        }




        const titleExists = await petitionST.checkSTitle(title);
        if(titleExists.length > 0){
            res.statusMessage = `Support title not unique within petition`;
            res.status(403).send();
            return;
        }


        const getTitleDescrip = await petitionST.getSupportTier(petitionID);
        if (title === undefined){
            for (const supportT of getTitleDescrip){
                if(supportT.id === supportSTID){
                    title = supportT.title;
                }
            }
        }

        if (description === undefined){
            for (const supportT of getTitleDescrip){
                if(supportT.id === supportSTID){
                    description = supportT.description;
                }
            }
        }
        const supporterST = await petitionST.getSupporter(petitionID)
        for (const supporter of supporterST){
            if (supporter.support_tier_id === supportSTID){
                res.statusMessage = `Can not edit a support tier if a supporter already exists for it`;
                res.status(403).send();
                return;
            }
        }

        const result = await petitionST.updateSupportTier(supportSTID, description, title, cost);
        res.statusMessage = "OK";
        res.status(200).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteSupportTier = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        if (token === undefined){
            res.statusMessage = `Unauthorized`;
            res.status(401).send();
            return;
        }

        const petitionID = parseInt(req.params.id, 10);
        const supportSTID = parseInt(req.params.tierId, 10);



        if(isNaN(petitionID)){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        if(isNaN(supportSTID)){
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

        if(userID !== ownerID[0].ownerId) {
            res.statusMessage = `Only the owner of a petition may change it`;
            res.status(403).send();
            return;
        }



        const supporterST = await petitionST.getSupporter(petitionID)
        for (const supporter of supporterST){
            if (supporter.support_tier_id === supportSTID){
                res.statusMessage = `Can not edit a support tier if a supporter already exists for it`;
                res.status(403).send();
                return;
            }
        }

        const supportTierNum = await petitionST.getSupportTier(petitionID);
        if (supportTierNum.length <= 1){
            res.statusMessage = `Can not remove a support tier if it is the only one for a petition`;
            res.status(403).send();
            return;
        }

        const resultDelete = await petitionST.deleteSupportTier(supportSTID);
        if (!resultDelete){          //NEED TO FIX
            res.statusMessage = "Not found";
            res.status(404).send();
            return
        }
        res.statusMessage = "OK";
        res.status(200).send();

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {addSupportTier, editSupportTier, deleteSupportTier};