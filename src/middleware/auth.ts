import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import sendResponse from "../utils/sendResponst";

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    req.query.Authorization !== undefined ||
    req.query.authorization !== undefined
  ) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Send the access token in the Authorization header, not the URL",
    });
  }

  const authorization = req.headers.authorization;
  const cookieToken =
    req.headers.cookie?.match(/(?:^|;\s*)accessToken=([^;]*)/)?.[1];
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  const token =
    authorization === undefined ? cookieToken : match?.[1];

  if (!token) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: authorization
        ? "Invalid authorization header"
        : "Access token is required",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt_sec);
  } catch {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid or expired access token",
    });
  }

  if (typeof decoded === "string") {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid access token",
    });
  }

  const id = Reflect.get(decoded, "id") as unknown;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid access token",
    });
  }

  req.user = decoded;
  next();
};

export default authenticate;
