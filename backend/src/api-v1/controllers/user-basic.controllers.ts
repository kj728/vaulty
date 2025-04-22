import { Request, Response } from "express";
import { loginEmailSchema, loginUsernameSchema, registerSchema, userDetailsSchema } from "../validators/user-basic.validators";
import { v4 as uid } from 'uuid';
import mysql from 'mysql2/promise';
import { sqlConfig } from "../../config";
import { UserDetails, Users } from "../models/user.model";
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
      response.status(400).json({ error: error.details[0].message })
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
        response.status(400).json({ error: error.details[0].message })
        return
      }
      //get the user from the database
      const [rows, fields] = await connection.query(
        `SELECT * FROM userBasicInfo WHERE email='${emailOrUsername}' AND isDeleted=0;`
      )
      connection.release()
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
        response.status(400).json({ error: error.details[0].message })
        return
      }

      //get the user from the database
      const [rows, fields] = await connection.query(
        `SELECT * FROM userBasicInfo WHERE username='${emailOrUsername}' AND isDeleted=0;`
      )
      connection.release()
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


export const addUserDetails = async (request: Request<{ id: string }>, response: Response): Promise<void> => {
  const { id: userId } = request.params
  const id = uid()
  const { gender, dob, profilePic } = request.body
  const connection = await pool.getConnection()
  try {
    //validate the data
    const { error } = userDetailsSchema.validate(request.body)
    if (error) {
      console.error("Validation error:", error.details[0].message)
      response.status(400).json({ error: error.details[0].message })
      return
    }

    //check if the user exists using the userId provided in the params
    const [rows1, fields1] = await connection.query(
      `SELECT * FROM userBasicInfo WHERE id='${userId}' AND isDeleted=0;`
    )
    connection.release()
    const User = rows1 as Array<Users>
    //check if the user exists
    if (User.length === 0) {
      response.status(401).json({ error: `Oops! User does not exist.` })
      return
    }

    //if the user exists, add the user details to the database
    const [rows2, fields2] = await connection.query(
      `INSERT INTO userPersonalInfo VALUES(
        '${id}',
        '${userId}',
        '${gender}',
        '${dob}',
        '${profilePic}',
        1,
        DEFAULT
      );`
    )
    connection.release()
    const userDetails = rows2 as Array<UserDetails>

    //check if the user details were added successfully
    if (userDetails.length === 0) {
      response.status(401).json({ error: `Oops! User details were not added successfully. Try again?` })
      return
    }
    //if the user details were added successfully, return the user's details
    response.status(200).json({
      message: `Congratulations ${User[0].username}! Your details have been added successfully.`,
    })


  } catch (error: sqlError | any) {
    console.error("Error registering user:", error)
    response.status(500).json({ message: `An error occured: ` + error.sqlMessage })

  }


}

export const deactivateAccount = async (request: Request<{ id: string }>, response: Response): Promise<void> => {
  const { id: userId } = request.params
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

    //if the user exists, deactivate the account by setting isDeleted to 1
    const [rows2, fields2] = await connection.query(
      `UPDATE userBasicInfo SET isDeleted=1 WHERE id='${userId}';`
    )
    connection.release()
    const deactivatedUser = rows2 as Array<Users>

    //check if the account was deactivated successfully
    if (deactivatedUser.length === 0) {
      response.status(401).json({ error: `Oops! Account was not deactivated successfully. Try again?` })
      return
    }
    //if the account was deactivated successfully, return a success message
    response.status(200).json({
      message: `Your account has been deactivated successfully. It will be permanently deleted in 7 days.`,
    })


  } catch (error: sqlError | any) {
    console.error("Error registering user:", error)
    response.status(500).json({ error: `An error occured: ` + error.sqlMessage })

  }
}

export const reactivateAccount = async (request: Request<{ id: string }>, response: Response): Promise<void> => { 
  const { id: userId } = request.params
  const connection = await pool.getConnection()
  try {
    //check if the user exists using the userId provided in the params
    const [rows1, fields1] = await connection.query(
      `SELECT * FROM userBasicInfo WHERE id='${userId}' AND isDeleted=1;`
    )
    connection.release()
    const User = rows1 as Array<Users>
    //check if the user exists
    if (User.length === 0) {
      response.status(401).json({ message: `Oops! User does not exist.` })
      return
    }

    //if the user exists, reactivate the account by setting isDeleted to 0
    const [rows2, fields2] = await connection.query(
      `UPDATE userBasicInfo SET isDeleted=0 WHERE id='${userId}';`
    )
    connection.release()
    const reactivatedUser = rows2 as Array<Users>

    //check if the account was reactivated successfully
    if (reactivatedUser.length === 0) {
      response.status(401).json({ error: `Oops! Account was not reactivated successfully. Try again?` })
      return
    }
    //if the account was reactivated successfully, return a success message
    response.status(200).json({
      message: `Congratulations ${User[0].username}! Your account has been reactivated successfully.`,
    })


  } catch (error: sqlError | any) {
    console.error("Error registering user:", error)
    response.status(500).json({ error: `An error occured: ` + error.sqlMessage })

  }

}
