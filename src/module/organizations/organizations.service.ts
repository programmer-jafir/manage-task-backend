import { pool } from "../../db";
import type {
  ICreateOrganization,
  IOrganizationDetails,
  IOrganization,
  IOrganizationMembership,
} from "./organizations.interface";

const getOrganizationForMemberFromDB = async (
  organizationId: number,
  userId: number,
): Promise<IOrganizationDetails | null> => {
  const result = await pool.query<IOrganizationDetails>(
    `
    SELECT
      o.id,
      o.name,
      o.description,
      o.owner_id AS "ownerId",
      COUNT(members.user_id)::INTEGER AS "memberCount",
      o.created_at AS "createdAt"
    FROM organizations o
    JOIN organization_members current_member
      ON current_member.organization_id = o.id
      AND current_member.user_id = $2
    LEFT JOIN organization_members members
      ON members.organization_id = o.id
    WHERE o.id = $1
    GROUP BY o.id, o.name, o.description, o.owner_id, o.created_at
    `,
    [organizationId, userId],
  );

  return result.rows[0] ?? null;
};

const getUserOrganizationsFromDB = async (
  userId: number,
): Promise<IOrganizationMembership[]> => {
  const result = await pool.query<IOrganizationMembership>(
    `
    SELECT o.id, o.name, om.role
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = $1
    ORDER BY o.id
    `,
    [userId],
  );

  return result.rows;
};

const createOrganizationInDB = async (
  payload: ICreateOrganization,
  ownerId: number,
): Promise<IOrganization> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<IOrganization>(
      `
      INSERT INTO organizations (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        description,
        owner_id AS "ownerId",
        created_at AS "createdAt"
      `,
      [payload.name, payload.description, ownerId],
    );
    const organization = result.rows[0];
    if (!organization) {
      throw new Error("Organization creation returned no record");
    }

    await client.query(
      `
      INSERT INTO organization_members (organization_id, user_id, role)
      VALUES ($1, $2, 'owner')
      `,
      [organization.id, ownerId],
    );

    await client.query("COMMIT");
    return organization;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const organizationsService = {
  getOrganizationForMemberFromDB,
  getUserOrganizationsFromDB,
  createOrganizationInDB,
};
