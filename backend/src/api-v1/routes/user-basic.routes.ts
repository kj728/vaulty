
import express from 'express';
import { registerUser } from '../controllers/user-basic.controllers';

export const authRouter = express.Router()


authRouter.post('/register',registerUser)