import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'


const getAll = async (q:any, categoryIds:any, supportingCost:any, ownerId:any, supporterId:any, sortBy:any): Promise<any> => {
    const conn = await getPool().getConnection();
    let query = `SELECT P.id as petitionId, ` +
                            `P.title, ` +
                            `P.category_id as categoryId, ` +
                            `P.owner_id as ownerId, ` +
                            `U.first_name as ownerFirstName, ` +
                            `U.last_name as ownerLastName, ` +
                            `(SELECT COUNT(*) FROM supporter as S WHERE P.id = S.petition_id) as numberOfSupporters, ` +
                            `P.creation_date as creationDate, ` +
                            `ST.cost as supportingCost ` +
                            `FROM petition as P ` +
                            `LEFT JOIN user as U ON P.owner_id = U.id ` +
                            `LEFT JOIN support_tier as ST ON ST.petition_id = P.id WHERE `


    if(supporterId !== undefined){
        query = query.slice(0, -7);
        query += ` INNER JOIN supporter S ON S.petition_id = P.id AND S.user_id = ${supporterId} WHERE `;
    }

    if(categoryIds !== undefined){
        for(let i = 0; i < categoryIds.length; i++){
            const numCategoryIds= await checkCategoryId(categoryIds[i]);
            if(numCategoryIds.length <= 0){
                return;
            }
            if (categoryIds.length ===1) {
                query += `P.category_id = ${categoryIds[i]} AND `;
            } else if (i === categoryIds.length - 1){
                query += `P.category_id = ${categoryIds[i]}) AND `;
            } else{
                query += `(P.category_id = ${categoryIds[i]} OR `
            }
        }
    }

    if(supportingCost !== undefined){
        supportingCost = parseInt(supportingCost,10);
        query += ` ST.cost = (SELECT MIN(ST2.cost) FROM support_tier AS ST2 WHERE ST2.petition_id = P.id AND ST2.cost <= ${supportingCost}) AND `;
    }
    else {
        query += ` ST.cost = (SELECT MIN(ST2.cost) FROM support_tier AS ST2 WHERE ST2.petition_id = P.id) AND `;
    }


    if(q !== undefined){
        query += `(P.title LIKE '%${q}%' OR P.description LIKE '%${q}%') AND `;
    }
    if(ownerId !== undefined){
        query += `P.owner_id = ${ownerId} AND `;
    }


    if (query.endsWith(' AND ')){
        query = query.slice(0, -5);
    }
    if (query.endsWith(' WHERE ')){
        query = query.slice(0, -7);
    }

    let sortKey = 'creation_date ASC';
    if(sortBy !== undefined){
        if (sortBy === 'ALPHABETICAL_ASC') {
            sortKey = 'title ASC';
        } else if (sortBy === 'ALPHABETICAL_DESC') {
            sortKey = 'title DESC'
        } else if (sortBy === 'COST_ASC') {
            sortKey = 'supportingCost ASC'
        } else if (sortBy === 'COST_DESC') {
            sortKey = 'supportingCost DESC'
        } else if (sortBy === 'CREATED_ASC') {
            sortKey = 'creationDate ASC'
        } else if (sortBy === 'CREATED_DESC') {
            sortKey = 'creationDate DESC'
        }
    }
    query += ` ORDER BY ${sortKey}, P.id ASC`;

    const [ result ] = await conn.query(query);
    await conn.release();
    return result;
}



const checkCategoryId = async (id: number) : Promise<Category[]> => {
    const query = 'SELECT * FROM category WHERE id  = ?'
    const conn = await getPool().getConnection();
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}



const getPetition = async (id: any) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = `SELECT P.id as petitionId, ` +
                            `P.title, ` +
                            `P.category_id as categoryId, ` +
                            `P.owner_id as ownerId, ` +
                            `U.first_name as ownerFirstName, ` +
                            `U.last_name as ownerLastName, ` +
                            `(SELECT COUNT(*) FROM supporter as S WHERE P.id = S.petition_id) as numberOfSupporters, ` +
                            `P.creation_date as creationDate, ` +
                            `P.description as description, ` +
                            `(SELECT SUM(cost) FROM support_tier as ST WHERE P.id = ST.petition_id) as moneyRaised ` +
                        // `ST.cost as supportingCost ` +
                        `FROM petition as P ` +
                        `LEFT JOIN user as U ON P.owner_id = U.id WHERE P.id = ?`;

    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}



const getSupportTier = async (id: any) : Promise<SupportTier[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT title, description, cost, id as supportTierId FROM support_tier WHERE petition_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}


const insertPetition = async (categoryIds: number, description: string, title: string, imageFilename: string, creationDate: string, ownerID: number) : Promise<ResultSetHeader> => {
    Logger.info(`Adding Petition"${categoryIds} ${description}" ${title} to the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT into petition (title, description, creation_date, image_filename, owner_id, category_id) VALUES (?, ?, ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [title, description, creationDate, imageFilename, ownerID, categoryIds] );
    await conn.release();
    return result;
};


const insertST = async (petitionID: number, description: string, title: string, cost: number) : Promise<ResultSetHeader> => {
    Logger.info(`Adding supportTiers to the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT into support_tier (petition_id, title, description, cost) VALUES (?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [petitionID, title, description, cost] );
    await conn.release();
    return result;
};


const checkPTitle = async (title: string) : Promise<Petition[]> => {
    Logger.info(`Adding Petition to the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM petition WHERE title = ?';
    const [result] = await conn.query(query, [title]);
    await conn.release();
    return result;
};


const updatePetition = async (petitionID: number, categoryIds: number, description: string, title: string, imageFilename: string, creationDate: string): Promise<Petition[]> =>{
    Logger.info(`userUpdate`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE petition SET title = ?, description = ?, creation_date = ?, category_id = ? WHERE id = ?';
    const [result] = await conn.query(query, [title, description, creationDate, categoryIds, petitionID]);
    await conn.release();
    return result;
}


const getCategorie = async () : Promise<Category[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM category`;
    const [result] = await conn.query(query);
    await conn.release();
    return result;
}

const checkSupporter= async (id: number) : Promise<boolean> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM supporter WHERE petition_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();

    return result.length > 0;
}

const deleteP= async (id: number) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = `DELETE FROM petition WHERE id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return;
}


export {getAll, checkCategoryId, getPetition, getSupportTier, insertPetition, insertST, checkPTitle, updatePetition, getCategorie, checkSupporter, deleteP}