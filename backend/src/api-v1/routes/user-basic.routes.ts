
import express from 'express';
import { addUserDetails, loginUser, registerUser } from '../controllers/user-basic.controllers';

export const authRouter = express.Router()


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/add-details/:id',addUserDetails)