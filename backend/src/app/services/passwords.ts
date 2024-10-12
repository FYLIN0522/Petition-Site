import * as bcrypt from 'bcrypt';

const hash = async (password: string): Promise<string> => {
    // Todo: update this to encrypt the password
    const hashPassword = bcrypt.hash(password, 5);
    return hashPassword
}

const compare = async (password: string, comp: string): Promise<boolean> => {
    // Todo: (suggested) update this to compare the encrypted passwords
    const match = await bcrypt.compare(password, comp);
    return match
}

export {hash, compare}