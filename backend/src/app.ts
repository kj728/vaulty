import express,{json} from 'express'
import dotenv from 'dotenv'
import { authRouter } from './api-v1/routes/user-basic.routes'

dotenv.config()

const app = express()

// middleware. add body to all requests
app.use(json())
app.use('/auth',authRouter)

export default app