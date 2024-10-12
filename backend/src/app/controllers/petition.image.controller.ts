import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as users from '../models/user.model';
import * as petitionImage from '../models/petition.image.model';
import * as petitions from '../models/petition.model';
import * as schemas from '../resources/schemas.json';
import * as passwords from '../services/passwords';
import path from "node:path";
import fs from "mz/fs";
import {getPetition} from "../models/petition.model";


const getImage = async (req: Request, res: Response): Promise<void> => {

    try{
        const petitionID = parseInt(req.params.id, 10);

        if (isNaN(petitionID)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(500).send();
            return
        }

        const result = await petitionImage.getPetition(petitionID);
        if(result.length <= 0){
            res.statusMessage = "No petition with id";
            res.status(404).send();
            return
        }

        if(result[0].image_filename === null){
            res.statusMessage = "Petition has no image";
            res.status(404).send();
            return
        } else {
            const type = result[0].image_filename.split('.')[1];
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
        const petitionID = parseInt(req.params.id, 10);
        const image = req.body
        const imageType = req.get('Content-Type');

        if (isNaN(petitionID)){
            res.statusMessage = "Bad Request. Invalid information";
            res.status(400).send();
            return
        }

        const result = await petitionImage.getPetition(petitionID);
        if(result.length <= 0){
            res.statusMessage = "Not Found. No petition found with id";
            res.status(404).send();
            return
        }

        if (token === undefined){
            res.statusMessage = "Unauthorized";
            res.status(401).send();
            return
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
            res.statusMessage = `Forbidden. Only the owner of a petition can change the hero image`;
            res.status(403).send();
            return;
        }


        if (!['image/png', 'image/jpeg', 'image/gif'].includes(imageType)) {
            res.status(400).send('Bad Request. Invalid image supplied (possibly incorrect file type)');
            return;
        }

        const idImage = `petition_${petitionID}.${imageType.split('/')[1]}`;
        const filePath = path.join(__dirname, '../../../storage/images', idImage);
        await fs.writeFile(filePath, image);


        if (result[0].image_filename === null) {
            await petitionImage.updateImage(petitionID, idImage)
            res.statusMessage = "Created. New image created";
            res.status(201).send();

        } else {
            await petitionImage.updateImage(petitionID, idImage)
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


export {getImage, setImage};