import mysql from 'mysql2/promise';
import { sqlConfig } from '../../config';
import { Request, Response } from 'express';
import { Users } from '../models/user.model';
import { sqlError } from '../models/user-basic.models';
import { emailSchema } from '../validators/user-basic.validators';

const pool = mysql.createPool(sqlConfig)
export const getUserByEmail = async (request: Request, response: Response): Promise<void> => {
    const { email } = request.body
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/

    const connection = await pool.getConnection()
    try {

        if (!emailRegex.test(email)) {
            response.status(400).json({ message: `Invalid email format.` })
            return
        }

        //validate the data
        const { error } = emailSchema.validate(request.body)
        if (error) {
            console.error("Validation error:", error.details[0].message)
            response.status(400).json({ error: error.details[0].message })
            return
        }

        //check if the user exists using the email provided in the body
        const [rows1, fields1] = await connection.query(
            `SELECT * FROM userBasicInfo WHERE email='${email}' AND isDeleted=0;`
        )
        connection.release()
        const User = rows1 as Array<Users>
        //check if the user exists
        if (User.length === 0) {
            response.status(401).json({ message: `Oops! User does not exist.` })
            return
        }
        //if the user exists, return the user details
        response.status(200).json({
            message: `User found successfully.`,
            data: User[0]
        })
    } catch (error: sqlError | any) {
        console.error("Error registering user:", error)
        response.status(500).json({ message: `An error occured: ` + error.sqlMessage })
    }
}