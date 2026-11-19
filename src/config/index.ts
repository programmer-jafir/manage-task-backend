import dotenv from "dotenv"
import path from "path"
dotenv.config({
    path:path.join(process.cwd(), ".env")
})

const config = {
    port: process.env.PORT,
    connection_string : process.env.DATABASE_URL as string,
    jwt_sec: process.env.Jwt_Secrit as string,
    jwt_refresh_sec: process.env.Jwt_Refresh as string,
}

export default config;