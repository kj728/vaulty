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

export const getUsers = async (request: Request, response: Response): Promise<void> => {
    const connection = await pool.getConnection()
    try {
        const [rows1, fields1] = await connection.query(
            `SELECT * FROM userBasicInfo WHERE isDeleted=0;`
        )
        connection.release()
        const Users = rows1 as Array<Users>
        //check if the user exists
        if (Users.length === 0) {
            response.status(401).json({ message: `Oops! User does not exist.` })
            return
        }
        //if the user exists, return the user details
        response.status(200).json({
            message: `Users found successfully.`,
            data: Users
        })
    } catch (error: sqlError | any) {
        console.error("Error registering user:", error)
        response.status(500).json({ message: `An error occured: ` + error.sqlMessage })
    }
}


export const updateUser = async (request: Request<{ id: string }>, response: Response): Promise<void> => {
    const { id: userId } = request.params
    const { username, email, phoneNumber, password, gender, dob, profilePic } = request.body
    const connection = await pool.getConnection()

    try {

        //check if the user exists using the userId provided in the params
        const [rows1, fields1] = await connection.query(
            `SELECT * FROM userBasicInfo WHERE id='${userId}' AND isDeleted=0;`
        )
        connection.release()
        const User = rows1 as Array<Users>
        //check if the user exists
        if (User.length === 0) {
            response.status(401).json({ message: `Oops! User does not exist.` })
            return
        }
        //if the user exists, update the user details in the database
        const [rows2, fields2] = await connection.query(
            `UPDATE userBasicInfo SET 
            username='${username}',
            email='${email}',
            phoneNumber='${phoneNumber}',
            password='${password}',
            WHERE id='${User[0].id}' AND isDeleted=0;
         
            UPDATE userDetails SET
            gender='${gender}',
            dob='${dob}',
            profilePic='${profilePic}'
            WHERE id='${User[0].id}';`
        )

        connection.release()
        const updatedUser = rows2 as Array<Users>
        //check if the user details were updated successfully
        if (updatedUser.length === 0) {
            response.status(401).json({ message: `Oops! User details not updated.` })
            return
        }
        //if the user details were updated successfully, return the user details
        response.status(200).json({
            message: `User details updated successfully.`,
            data: updatedUser[0]
        })
        
    } catch (error: sqlError | any) {
        console.error("Error updating user:", error)
        response.status(500).json({ message: `An error occured: ` + error.sqlMessage })

    }

}