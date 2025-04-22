import { Request, Response } from "express";
import { loginEmailSchema, loginUsernameSchema, registerSchema } from "../validators/user-basic.validators";
import { v4 as uid } from 'uuid';
import mysql from 'mysql2/promise';
import { sqlConfig } from "../../config";
import { Users } from "../models/user.model";
import { error } from "console";
import { sqlError } from "../models/user-basic.models";

const pool = mysql.createPool(sqlConfig)



export const registerUser = async (request: Request, response: Response): Promise<void> => {
  const { username, email, phoneNumber, password } = request.body
  try {
    //validate the data
    const { error } = registerSchema.validate(request.body)

    if (error) {
      console.error("Validation error:", error.details[0].message)
      response.status(400).json({ message: error.details[0].message })
      return
    }

    //add the user to the database
    const id = uid()
    const connection = await pool.getConnection()

    const [rows1, fields1] = await connection.query(
      `INSERT INTO userBasicInfo VALUES(
        '${id}',
        '${username}',
        '${email}',
        '${phoneNumber}',
        '${password}',
        DEFAULT,
        DEFAULT,
        0,
        0,
        0
        );`
    )

    const [rows2, fields2] = await connection.query(
      `SELECT * FROM userBasicInfo
        WHERE id='${id}' AND isDeleted=0;`
    )
    connection.release()
    const User = rows2 as Array<Users>
    response.status(201).json({
      message: `Congratulations ${User[0].username}! You have successfully been registered on the system.`,

    })

  } catch (error: sqlError | any) {
    console.error("Error registering user:", error)
    response.status(500).json({ message: `An error occured: ` + error.sqlMessage })

  }
}

export const getUser = async (request: Request, response: Response): Promise<void> => { }

export const updateUser = async (request: Request, response: Response): Promise<void> => { }

export const deleteUser = async (request: Request, response: Response): Promise<void> => { }

export const loginUser = async (request: Request, response: Response): Promise<void> => {
  const { emailOrUsername, password } = request.body
  const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
  const connection = await pool.getConnection()


  try {

    //Email login
    if (emailRegex.test(emailOrUsername)) {
      //validate the data
      const { error } = loginEmailSchema.validate(request.body)
      if (error) {
        console.error("Validation error:", error.details[0].message)
        response.status(400).json({ message: error.details[0].message })
        return
      }
      //get the user from the database
      const [rows, fields] = await connection.query(
        `SELECT * FROM userBasicInfo WHERE email='${emailOrUsername}' AND isDeleted=0;`
      )
      const User = rows as Array<Users>

      //check if the user exists
      if (User.length === 0) {
        response.status(401).json({ message: `Oops! User does not exist. Try a different email/username?` })
        return
      }

      //if user exists compare the saved password with the one provided
      if (User[0].password !== password) {
        response.status(401).json({ error: `Oh no. Looks like the passwords do not match, try again?` })
        return
      }
      //if the password is correct, return the user's username
      response.status(200).json({
        message: `Welcome back ${User[0].username}!`,
      })
    }

    //Username login
    if (!emailRegex.test(emailOrUsername)) {

      //validate the data
      const { error } = loginUsernameSchema.validate(request.body)
      if (error) {
        console.error("Validation error:", error.details[0].message)
        response.status(400).json({ message: error.details[0].message })
        return
      }

      //get the user from the database
      const [rows, fields] = await connection.query(
        `SELECT * FROM userBasicInfo WHERE username='${emailOrUsername}' AND isDeleted=0;`
      )
      const User = rows as Array<Users>

      //check if the user exists
      if (User.length === 0) {
        response.status(401).json({ error: `Oops! User does not exist. Try a different email/username?` })
        return
      }

      //if user exists compare the saved password with the one provided 
      if (User[0].password !== password) {
        response.status(401).json({ error: `Oh no. Looks like the passwords do not match, try again?` })
        return
      }
      //if the password is correct, return the user's username
      response.status(200).json({
        message: `Welcome back ${User[0].username}!`,
      })
    }

  } catch (error: sqlError | any) {
    console.error("Error registering user:", error)
    response.status(500).json({ message: `An error occured: ` + error.sqlMessage })

  }

}