
import express from 'express';
import { addUserDetails, deactivateAccount, loginUser, reactivateAccount, registerUser } from '../controllers/user-basic.controllers';
import { getUserByEmail } from '../controllers/user-details.controller';

export const authRouter = express.Router()


authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/add-details/:id', addUserDetails)
authRouter.put('/deactivate/:id', deactivateAccount)
authRouter.patch('/reactivate/:id', reactivateAccount)

authRouter.get('/get-by-email',getUserByEmail)