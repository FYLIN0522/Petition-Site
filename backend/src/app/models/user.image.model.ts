import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'

const updateImage = async (id: number, image: string): Promise<User[]> =>{
    Logger.info(`userUpdate`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = ?  WHERE id = ?';
    const [result] = await conn.query(query, [image, id]);
    await conn.release();
    return result;
}


const deleteImage = async (id: number): Promise<User[]> =>{
    Logger.info(`logout`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
    const [result] = await conn.query(query, [null, id]);
    await conn.release();
    return result;
}


export {updateImage, deleteImage}