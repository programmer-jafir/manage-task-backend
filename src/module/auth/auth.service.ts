import jwt from "jsonwebtoken";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcrypt";
import config from "../../config";

const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password } = payload;

  const hashPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password) VALUES($1,$2,$3)
    RETURNING id,name,email
    `,
    [name, email, hashPassword],
  );

  const jwtPayload = {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
  };
  const accessToken = jwt.sign(jwtPayload, `${config.jwt_sec}`, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(jwtPayload, `${config.jwt_refresh_sec}`, {
    expiresIn: "30d",
  });

  return { user: result.rows[0], accessToken, refreshToken };
};

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );
  if (user.rowCount === 0) {
    throw new Error("Invlid credencial");
  }

  const matchPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!matchPassword) {
    throw new Error("Invalid crendencial");
  }
  // console.log(user.rows[0].is_active)

  if (!user.rows[0].is_active) {
    throw new Error("Access Denied!");
  }

  const jwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    email: user.rows[0].email,
  };
  const accessToken = jwt.sign(jwtPayload, `${config.jwt_sec}`, {
    expiresIn: "7d",
  });
  
  const refreshToken = jwt.sign(jwtPayload, `${config.jwt_refresh_sec}`, {
    expiresIn: "30d",
  });
  return { user: user.rows[0], accessToken, refreshToken };
};
export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
