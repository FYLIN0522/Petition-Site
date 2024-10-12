import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'

const updateImage = async (id: number, image: string): Promise<Petition[]> =>{
    Logger.info(`Petition Update`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE petition SET image_filename = ?  WHERE id = ?';
    const [result] = await conn.query(query, [image, id]);
    await conn.release();
    return result;
}


const getPetition = async (id: number) : Promise<Petition[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM petition WHERE id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

export {updateImage, getPetition}