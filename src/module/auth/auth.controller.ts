import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponst";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    sendResponse(res,{
      statusCode:201,
      success:true,
      message:"Registration successful",
      data: result,
    })
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success:false,
      message: error?.message,
      error: error,
    })
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse(res,{
      statusCode:201,
      success:true,
      message:"Login successful",
      data: result,
    })
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success:false,
      message: error?.message,
      error: error,
    })
  }
};
const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body; // Extract the string property

    if (!refreshToken) {
      return sendResponse(res,{
      statusCode:400,
      success:false,
      message:"Refresh token is required",
    })
       
    }

    const result = await authService.refreshTokenIntoDB(refreshToken);

    sendResponse(res,{
      statusCode:201,
      success:true,
      message:"Token refreshed",
      data: result,
    })
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success:false,
      message: error?.message,
      error: error,
    })
  }
};

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
};
