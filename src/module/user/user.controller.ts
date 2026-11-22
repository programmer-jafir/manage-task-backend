import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponst";
import type {
  IPublicUserProfile,
  IUserProfileUpdate,
} from "./user.interface";
import { userService } from "./user.service";

const getPublicProfile = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (
    typeof userId !== "string" ||
    !/^[1-9]\d*$/.test(userId) ||
    !Number.isSafeInteger(Number(userId))
  ) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const profile: IPublicUserProfile | null =
      await userService.getPublicUserProfileFromDB(Number(userId));
    if (!profile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile retrieved",
      data: profile,
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

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (typeof id !== "number") {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid access token",
      });
    }

    const profile = await userService.getUserProfileFromDB(id);
    if (!profile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile retrieved",
      data: profile,
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

const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (typeof id !== "number") {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid access token",
      });
    }

    const body: unknown = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "A profile update object is required",
      });
    }

    const payload = body as Record<string, unknown>;
    const fields = Object.keys(payload);
    const allowedFields = ["name", "bio", "address", "phone"];
    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Provide at least one supported profile field",
      });
    }

    if (fields.some((field) => typeof payload[field] !== "string")) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Profile fields must be strings",
      });
    }

    if (
      (typeof payload.name === "string" &&
        (payload.name.trim().length === 0 || payload.name.length > 255)) ||
      (typeof payload.phone === "string" && payload.phone.length > 30)
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "Name must be 1-255 characters and phone must be at most 30 characters",
      });
    }

    const updates: IUserProfileUpdate = {};
    if (typeof payload.name === "string") updates.name = payload.name.trim();
    if (typeof payload.bio === "string") updates.bio = payload.bio;
    if (typeof payload.address === "string") updates.address = payload.address;
    if (typeof payload.phone === "string") updates.phone = payload.phone;

    const profile = await userService.updateUserProfileInDB(id, updates);
    if (!profile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated",
      data: profile,
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

export const userController = {
  getPublicProfile,
  getMyProfile,
  updateMyProfile,
};
