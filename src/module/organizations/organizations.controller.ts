import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponst";
import type {
  ICreateOrganization,
  IOrganizationDetails,
} from "./organizations.interface";
import { organizationsService } from "./organizations.service";

const getOrganizationById = async (req: Request, res: Response) => {
  const organizationIdParam = req.params.orgId;
  const organizationId =
    typeof organizationIdParam === "string"
      ? Number(organizationIdParam)
      : NaN;
  if (
    typeof organizationIdParam !== "string" ||
    !/^[1-9]\d*$/.test(organizationIdParam) ||
    !Number.isSafeInteger(organizationId)
  ) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid organization ID",
    });
  }

  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid access token",
      });
    }

    const organization: IOrganizationDetails | null =
      await organizationsService.getOrganizationForMemberFromDB(
        organizationId,
        userId,
      );
    if (!organization) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Organization not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organization retrieved",
      data: organization,
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

const getMyOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid access token",
      });
    }

    const organizations =
      await organizationsService.getUserOrganizationsFromDB(userId);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organizations retrieved",
      data: organizations,
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

const createOrganization = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    if (typeof ownerId !== "number") {
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
        message: "Organization name and description are required",
      });
    }

    const payload = body as Record<string, unknown>;
    const allowedFields = ["name", "description"];
    if (
      Object.keys(payload).some((field) => !allowedFields.includes(field)) ||
      typeof payload.name !== "string" ||
      payload.name.trim().length === 0 ||
      payload.name.length > 255 ||
      typeof payload.description !== "string"
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "A valid name and description are required",
      });
    }

    const organizationPayload: ICreateOrganization = {
      name: payload.name.trim(),
      description: payload.description,
    };
    const organization = await organizationsService.createOrganizationInDB(
      organizationPayload,
      ownerId,
    );

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Organization created",
      data: organization,
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

export const organizationsController = {
  getOrganizationById,
  getMyOrganizations,
  createOrganization,
};
