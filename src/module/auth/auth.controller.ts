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
     const {refreshToken, accessToken} = result;

        res.cookie("accessToken",accessToken,{
          secure: false, // http-. false, http-> true in Production
          httpOnly:true, // Prevent XSS attack
          sameSite: "lax", //"none", "strict", "lax" -. CSRF
          // maxAge
          path: "/",
          domain: "localhost",  //.example.com
        })
        res.cookie("refreshToken",refreshToken,{
          secure: false, // http-. false, http-> true in Production
          httpOnly:true, // Prevent XSS attack
          sameSite: "lax", //"none", "strict", "lax" -. CSRF
          // maxAge
          path: "/",
          domain: "localhost",  //.example.com
        })
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

         const { accessToken} = result;

        res.cookie("accessToken",accessToken,{
          secure: false, // http-. false, http-> true in Production
          httpOnly:true, // Prevent XSS attack
          sameSite: "lax", //"none", "strict", "lax" -. CSRF
          // maxAge
          path: "/",
          domain: "localhost",  //.example.com
        })
        res.cookie("refreshToken",refreshToken,{
          secure: false, // http-. false, http-> true in Production
          httpOnly:true, // Prevent XSS attack
          sameSite: "lax", //"none", "strict", "lax" -. CSRF
          // maxAge
          path: "/",
          domain: "localhost",  //.example.com
        })

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


// need to work
const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Refresh token is required",
      });
    }
   await authService.logoutUserIntoDB(refreshToken);
    const cookieOptions = {
      secure: false, // http-. false, http-> true in Production
      httpOnly: true, // Prevent XSS attack
      sameSite: "lax" as const, //"none", "strict", "lax" -. CSRF
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);


    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Logout successfully",
      data: null,
    });

  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error?.message || "Something went wrong",
      error,
    });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (typeof id !== "number") {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await authService.getCurrentUserFromDB(id);
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error?.message || "Something went wrong",
      error,
    });
  }
};


export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
};
