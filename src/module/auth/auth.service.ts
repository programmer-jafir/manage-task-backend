import jwt, { type JwtPayload } from "jsonwebtoken";
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

const refreshTokenIntoDB = async (token: string) => {
    // 1. Verify the incoming refresh token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, `${config.jwt_refresh_sec}`) as JwtPayload;
  } catch (err) {
    throw new Error("Invalid or expired refresh token!");
  }

  const user = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [decoded.email],
  );
  if (user.rowCount === 0) {
    throw new Error("Invlid credencial");
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
  return { accessToken, refreshToken, user: user.rows[0] };
};


// need to work
const logoutUserIntoDB = async (token: string) => {
  // 1. Verify refresh token
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      config.jwt_refresh_sec
    ) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token!");
  }

  // 2. Find the user
  const user = await pool.query(
    `SELECT id, is_active FROM users WHERE email = $1`,
    [decoded.email]
  );

  if (user.rowCount === 0) {
    throw new Error("User not found!");
  }

  // 3. Check user status
  if (!user.rows[0].is_active) {
    throw new Error("Access denied!");
  }

  return null;
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
  refreshTokenIntoDB,
  logoutUserIntoDB
};
