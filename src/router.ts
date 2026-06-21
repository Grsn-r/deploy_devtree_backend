import { Router } from "express";
import {body} from 'express-validator';
import { createAccount, getUser, getUsersByHandle, login, searchByHandle, updateProfile, uploadImage } from "./Handlers/Index";
import { handleInputErrors } from "./middleware/validation";
import { authenticate } from "./middleware/auth";


const router = Router();

//autenticación y registro

router.post('/auth/register',
body('handle')
    .notEmpty()
    .withMessage('El handle no debe ir vacío'),
body('name')
    .notEmpty()
    .withMessage('El nombre no debe ir vacío'),
body('email')
    .isEmail()
    .withMessage('e-mail no válido'),
body('password')
    .isLength({min: 8})
    .withMessage('La constraseña debe tener al menos 8 caracteres'),
    handleInputErrors, 
    createAccount)

router.post('/auth/login',
body('email')
    .isEmail()
    .withMessage('e-mail no válido'),
body('password')
    .notEmpty()
    .withMessage('La constraseña es obligatoria'),
    login)

router.get('/user', authenticate, getUser)

router.patch('/user', 
    body('handle')
    .notEmpty()
    .withMessage('El handle no debe ir vacío'),
    handleInputErrors,
    authenticate, 
    updateProfile)

router.post('/user/image', authenticate, uploadImage)

router.get('/:handle', getUsersByHandle)

router.post('/search',
    body('handle').notEmpty().withMessage('El handle no piede ir vacío'),
    searchByHandle)

export default router;