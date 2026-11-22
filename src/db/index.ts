import { Pool } from "pg";
import config from "../config";
export const pool = new Pool({
     connectionString: config.connection_string,
})
export const initDB = async()=>{
    try{
         await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL  PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR (255) NOT NULL,
            is_Active BOOLEAN DEFAULT true,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
            `);
            await pool.query(`
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS bio TEXT,
                ADD COLUMN IF NOT EXISTS address TEXT,
                ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
                ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
                ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            `);
            console.log("Database connected!!");
    }catch(error){
        console.error(error);
        throw error;
    }
}