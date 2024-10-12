import Logger from '../../config/logger';
import { getPool } from '../../config/db';
import { ResultSetHeader } from 'mysql2'
import { randomBytes } from 'crypto';

const insert = async (firstName: string, lastName: string, email: string, password: string) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user "${firstName} ${lastName}" ${email} to the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [firstName, lastName, email, password] );
    await conn.release();
    return result;
};

const getUser = async (email: string): Promise<User[]> => {
    Logger.info(`User's Email info`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE email = ?';
    const [result] = await conn.query(query, [email]);
    await conn.release();
    // Logger.info(`${exist} `);
    return result;
};


const generateToken = async (email: string): Promise<string> =>{
    Logger.info(`generateToken`);
    const token = randomBytes(16).toString('hex');
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET auth_token = ? WHERE email = ?';
    const [result] = await conn.query(query, [token, email]);
    await conn.release();
    return token;
}

const checkToken = async (token: string): Promise<User[]> =>{
    Logger.info(`checkTokenExist`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    await conn.release();
    return result;
}

const logout = async (token: string): Promise<User[]> =>{
    Logger.info(`logout`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET auth_token = ? WHERE auth_token = ?';
    const [result] = await conn.query(query, [null, token]);
    await conn.release();
    return result;
}


const userID = async (id: number): Promise<User[]> =>{
    Logger.info(`checkToken`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE id = ?';
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

const userUpdate = async (id: number, firstName: string, lastName: string, email: string, password: string): Promise<User[]> =>{
    Logger.info(`userUpdate`);
    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET first_name = ?, last_name = ?, email = ?, password = ?  WHERE id = ?';
    const [result] = await conn.query(query, [firstName, lastName, email, password, id]);
    await conn.release();
    return result;
}



export {insert, getUser, generateToken, checkToken, logout, userID, userUpdate}