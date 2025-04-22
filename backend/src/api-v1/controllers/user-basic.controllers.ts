import { Request, Response } from "express";
import { registerSchema } from "../validators/user-basic.validators";
import { v4 as uid } from 'uuid';
import mysql from 'mysql2/promise';
import { sqlConfig } from "../../config";
import { Users } from "../models/user.model";

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

  } catch (error) {
    console.error("Error registering user:", error)
    response.status(500).json({ message: "Internal server error" })

  }
}