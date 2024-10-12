import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as schemas from '../resources/schemas.json';
import * as petitions from '../models/petition.model';
import * as v from '../../app/validate';
import * as users from '../models/user.model';
import {checkSupporter, deleteP, insertST} from "../models/petition.model";


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

const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.petition_search,
        req.query);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{
        let startIndex;

        if(req.query.startIndex === null){
            startIndex = 0;
        }else{
            startIndex = parseInt(req.query.startIndex as string,10);
        }
        let count = parseInt(req.query.count as string,10);
        const q = req.query.q;
        const categoryIds = req.query.categoryIds;
        const supportingCost = req.query.supportingCost;
        const ownerId = req.query.ownerId;
        const supporterId = req.query.supporterId;
        const sortBy = req.query.sortBy;


        const result = await petitions.getAll(q, categoryIds, supportingCost, ownerId, supporterId, sortBy);

        if (isNaN(count)){
            count = result.length;
        } else {
            count = count + startIndex;
        }

        res.statusMessage = "OK";
        res.status(200).send({"petitions": result.slice(startIndex, count), "count":result.length});

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



const getPetition = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.petition_search,
        req.query);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }

    try{
        let petitionData;
        const petitionID = parseInt(req.params.id, 10);
        const result = await petitions.getPetition(petitionID);

        if (result.length <= 0) {
            res.statusMessage = "Not Fount. No petition with id";
            res.status(404).send(result);
            return;
        }
        const supportTierResult = await petitions.getSupportTier(petitionID);
        if (supportTierResult.length <= 0) {
            petitionData = result[0];
        } else {
            petitionData = {
                ...result[0],
                supportTiers: supportTierResult
            }
        }
        res.statusMessage = "OK";
        res.status(200).send(petitionData);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addPetition = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.petition_post,
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

        const categoryIds = req.body.categoryId;
        const description = req.body.description;
        const title = req.body.title;
        const imageFilename = req.body.image_filename;
        const creationDate = getCurrentDateTime();
        const supportTiers = req.body.supportTiers;


        const userID = await users.checkToken(token);
        if (userID.length <= 0){
            res.statusMessage = `Unauthorized`;
            res.status(401).send();
            return;
        }
        const ownerID = userID[0].id;


        if (supportTiers.length > 3 && supportTiers.length < 1){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }


        const titleExists = await petitions.checkPTitle(title);
        if(titleExists.length > 0){
            res.statusMessage = `Petition title already exists`;
            res.status(403).send();
            return;
        }

        const result = await petitions.insertPetition(categoryIds, description, title, imageFilename, creationDate, ownerID);

        for(const supportTier of supportTiers){
            await petitions.insertST(result.insertId, supportTier.title, supportTier.description, supportTier.cost);
        }

        res.statusMessage = "OK";
        res.status(201).send({"petitionId": result.insertId});

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editPetition = async (req: Request, res: Response): Promise<void> => {
    const validation = await v.validate(
        schemas.petition_patch,
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
        let categoryIds = req.body.categoryId;
        let description = req.body.description;
        const title = req.body.title;
        const imageFilename = req.body.image_filename;
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

        if(userID !== ownerID[0].ownerId) {
            res.statusMessage = `Only the owner of a petition may change it`;
            res.status(403).send();
            return;
        }


        if(isNaN(categoryIds)){
            const cateId = await petitions.getPetition(petitionID);
            categoryIds = cateId[0].categoryId;
        }

        const titleExists = await petitions.checkPTitle(title);
        if(titleExists.length > 0){
            res.statusMessage = `Petition title already exists`;
            res.status(403).send();
            return;
        }
        if (description === undefined){
            description = "";
        }


        const result = await petitions.updatePetition(petitionID, categoryIds, description, title, imageFilename, creationDate);
        res.statusMessage = "OK";
        res.status(200).send(result);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deletePetition = async (req: Request, res: Response): Promise<void> => {
    try{
        const token = req.header("X-Authorization");
        if (token === undefined){
            res.statusMessage = `Unauthorized`;
            res.status(401).send();
            return;
        }


        const petitionID = parseInt(req.params.id, 10);
        if(isNaN(petitionID)){
            res.statusMessage = `Bad Request`;
            res.status(400).send();
            return;
        }

        const petitionExists = await petitions.getPetition(petitionID);
        if (petitionExists.length <= 0) {
            res.statusMessage = "Not Fount. No petition with id";
            res.status(404).send();
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

        const supportersExists = await petitions.checkSupporter(petitionID);
        if(supportersExists){
            res.statusMessage = "Can not delete a petition with one or more supporters";
            res.status(403).send();
            return;
        }

        await petitions.deleteP(petitionID);
        res.statusMessage = "Can not delete a petition with one or more supporters";
        res.status(200).send();


    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getCategories = async(req: Request, res: Response): Promise<void> => {
    const CategoriesID = parseInt(req.params.id, 10);

    try{
        const result = await petitions.getCategorie();
        res.statusMessage = "OK";
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories};