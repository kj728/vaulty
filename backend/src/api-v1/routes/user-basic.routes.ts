
import express from 'express';
import { addUserDetails, deactivateAccount, loginUser, registerUser } from '../controllers/user-basic.controllers';

export const authRouter = express.Router()


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/add-details/:id', addUserDetails)
authRouter.put('/deactivate/:id', deactivateAccount)