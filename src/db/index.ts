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
            await pool.query(`
                CREATE TABLE IF NOT EXISTS organizations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `);
            await pool.query(`
                ALTER TABLE organizations
                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS organization_members (
                    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    role VARCHAR(20) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (organization_id, user_id)
                );
            `);
            console.log("Database connected!!");
    }catch(error){
        console.error(error);
        throw error;
    }
}