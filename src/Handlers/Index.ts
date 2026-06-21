import User from "../models/User";
import {Request, Response} from 'express';
import slug from 'slug';
import formidable from 'formidable'
import {v4 as uuid} from 'uuid'
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import cloudinary from "../config/cloudinary";


export const createAccount = async (req: Request, res: Response)  => {

    const {email, password} = req.body;
    
    const userExist = await User.findOne({email});

    if (userExist) {
        const error = new Error('El email ya está registrado');
        return res.status(409).json({error: error.message});
    }
    
    const handle =  slug(req.body.handle, '');
    const handleExist =  await User.findOne({handle});

    if (handleExist) {
        const error = new Error('Nombre de usuario no disponible')
        return res.status(409).json({error: error.message});
    }

    const user = new User(req.body);
    user.password = await hashPassword(password);
    user.handle =  handle;
    
    await user.save();
    res.status(201).send('Registro creado correctamente');
}

export const login = async (req: Request, res: Response) => {

    const {email, password} = req.body;
    
    const user = await User.findOne({email});

    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({error: error.message});
    }

    const isPasswordCorrect = await checkPassword(password, user.password);
    console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
        const error = new Error('Contraseña incorrecta');
        return res.status(401).json({error: error.message});
    }

    const token = generateJWT({id: user._id});

    res.send(token);
} 

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user);
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const {description, links} = req.body
        const handle =  slug(req.body.handle, '');
    const handleExist =  await User.findOne({handle});

    if (handleExist && handleExist.email !== req.user.email) {
        const error = new Error('Nombre de usuario no disponible')
        return res.status(409).json({error: error.message});
    }

    req.user.handle = handle
    req.user.description = description
    req.user.links = links
    await req.user.save()
    res.send('Perfil actualizado')
    
    } catch (e) {
        const error = new Error('Se ha prodcido un error')
        return res.status(500).json({message: error.message})
    }
}
// esto requiere de npm formidable y cloudinary (instrucciones en página)
export const uploadImage = async (req: Request, res: Response) => {

    const form = formidable({multiples: false})
    
    try {
        form.parse(req, (err, fields, files) => {

        cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid() }, async function(error, result) {
            if (error) {
                const error = new Error('Error al subir la imágen')
                return res.status(500).json({message: error.message})
            }
            if (res) {
                req.user.image = result.secure_url
                await req.user.save()
                res.json({image: result.secure_url})
            }
        })
    })
    } catch (e) {
        const error = new Error('Se ha prodcido un error')
        return res.status(500).json({message: error.message})
    }
}

export const getUsersByHandle = async (req: Request, res: Response) => {
    try {
        const {  handle } = req.params
        const user = await User.findOne({handle}).select('-_id -__v -email -password')
        if (!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({error: error.message})
        }
        res.json(user)
        console.log(user)
    } catch (e) {
        const error = new Error('Se ha prodcido un error')
        return res.status(500).json({message: error.message})
    }
}

export const searchByHandle = async (req: Request, res: Response) => {
    try {
        const {handle} = req.body
        const userExist = await User.findOne({handle})
        if (userExist) {
            const error = new Error(`${handle} ya está registrado`)
            return res.status(409).json({error: error.message})
        }
        res.send(`${handle} está disponible`)
    } catch (e) {
        const error = new Error('Se ha prodcido un error')
        return res.status(500).json({message: error.message})
    }
}