import bcrypt from 'bcrypt';

export const hashPassword = async (password : string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt);
} 

export const checkPassword = async (enterdPAssword : string, hash : string) => {
    return await bcrypt.compare(enterdPAssword, hash);
}