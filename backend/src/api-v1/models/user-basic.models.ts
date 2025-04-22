
export interface sqlConfiguration{
    host:string,
    user?:string,
    password?:string,
    database?:string,
    waitForConnections?: boolean,
    connectionLimit?: number,
    maxIdle?: number,
    idleTimeout?: number,
    queueLimit?: number,
    enableKeepAlive?: boolean,
    keepAliveInitialDelay?: number,

}

export interface UsersBasicInfo {
    id:number,
    username:string,
    email:string,
    phoneNumber:string,
    password:string,
    createdAt:string,
    isEmailVerified:string,
    isDeleted:string
}

export interface UsersPersonalInfo {
    id:number,
    userId:number,
    gender:string,
    dob:string,
    profilePic:string,
    agreedToTos:string,
    lastUpdated:string
}

export interface sqlError {
    code:string,
    errno:number,
    sql:string,
    sqlState:string,
    sqlMessage:string,
}

