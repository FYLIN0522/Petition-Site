import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'


const getSupporterTimestamp = async (Pid: number) : Promise<Supporter[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT S.id AS supportId,` +
                                `S.support_tier_id  AS supportTierId,` +
                                `S.message AS message, `  +
                                `U.id AS supporterId, ` +
                                `U.first_name AS supporterFirstName, ` +
                                `U.last_name AS supporterLastName, `+
                                `S.timestamp AS timestamp ` +
                                `FROM supporter AS S ` +
                                `LEFT JOIN user as U ON S.user_id = U.id LEFT JOIN support_tier AS ST ON S.support_tier_id = ST.id  WHERE S.petition_id = ? ORDER BY timestamp DESC`;

    const [result] = await conn.query(query, [Pid]);
    await conn.release();
    return result;
}


const getSupporterFromSTid = async (id: number) : Promise<Supporter[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM supporter WHERE support_tier_id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

const insertSupporter = async (Pid: number, STid: number, Uid: number, message: string, creationDate: string): Promise<Petition[]> =>{
    const conn = await getPool().getConnection();
    const query = 'INSERT into supporter (petition_id, support_tier_id, user_id, message, timestamp) VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.query(query, [Pid, STid, Uid, message, creationDate]);
    await conn.release();
    return result;
}

const checkPidSTidExists = async (Pid: number, STid: number): Promise<boolean> =>{
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM petition as P LEFT JOIN support_tier as ST ON ST.petition_id = P.id ' +
                        'WHERE P.id = ? AND ST.id = ?';

    const [result] = await conn.query(query, [Pid, STid]);
    await conn.release();
    return result.length > 0;
}

export {getSupporterTimestamp, getSupporterFromSTid, insertSupporter, checkPidSTidExists}