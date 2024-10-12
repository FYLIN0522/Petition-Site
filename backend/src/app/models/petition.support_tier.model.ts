import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'

const checkSTitle = async (title: string) : Promise<SupportTier[]> => {
    Logger.info(`Adding supportTiers to the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM support_tier WHERE title = ?';
    const [result] = await conn.query(query, [title]);
    await conn.release();
    return result;
};

const checkSupportTier= async (id: number) : Promise<boolean> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM support_tier WHERE petition_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result.length > 3;
}

const updateSupportTier = async (id: number, description: string, title: string, cost: number): Promise<Petition[]> =>{
    Logger.info(`userUpdate`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE support_tier SET title = ?, description = ?, cost = ? WHERE id = ?';
    const [result] = await conn.query(query, [title, description, cost, id]);
    await conn.release();
    return result;
}

const getSupporter = async (id: number) : Promise<Supporter[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM supporter WHERE petition_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

const getSupportTier = async (id: number) : Promise<SupportTier[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM support_tier WHERE petition_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}



const deleteSupportTier= async (id: number) : Promise<any> => {
    const conn = await getPool().getConnection();
    const query = `DELETE FROM support_tier WHERE id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result.affectedRows > 0;
}

export{checkSTitle, checkSupportTier, updateSupportTier, getSupporter, getSupportTier, deleteSupportTier}