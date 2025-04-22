
import express from 'express';
import { loginUser, registerUser } from '../controllers/user-basic.controllers';

export const authRouter = express.Router()


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)