import { pool } from "../../db";
import type {
  ICreateOrganization,
  IOrganizationDetails,
  IOrganization,
  IOrganizationMembership,
  IUpdatedOrganization,
  IUpdateOrganization,
  TDeleteOrganizationResult,
  TUpdateOrganizationResult,
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
    WHERE o.id = $1 AND o.deleted_at IS NULL
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
    WHERE om.user_id = $1 AND o.deleted_at IS NULL
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

const updateOrganizationInDB = async (
  organizationId: number,
  userId: number,
  updates: IUpdateOrganization,
): Promise<TUpdateOrganizationResult> => {
  const result = await pool.query<IUpdatedOrganization>(
    `
    UPDATE organizations o
    SET
      name = COALESCE($2, o.name),
      description = COALESCE($3, o.description)
    WHERE o.id = $1
      AND o.deleted_at IS NULL
      AND (
        o.owner_id = $4
        OR EXISTS (
          SELECT 1
          FROM organization_members om
          WHERE om.organization_id = o.id
            AND om.user_id = $4
            AND om.role IN ('owner', 'admin')
        )
      )
    RETURNING o.id, o.name, o.description
    `,
    [organizationId, updates.name ?? null, updates.description ?? null, userId],
  );
  const organization = result.rows[0];
  if (organization) {
    return { status: "updated", organization };
  }

  const exists = await pool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1 AND deleted_at IS NULL) AS exists",
    [organizationId],
  );
  if (!exists.rows[0]?.exists) {
    return { status: "not_found" };
  }

  return { status: "forbidden" };
};

const deleteOrganizationInDB = async (
  organizationId: number,
  userId: number,
): Promise<TDeleteOrganizationResult> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const organizationResult = await client.query<{ ownerId: number }>(
      `
      SELECT owner_id AS "ownerId"
      FROM organizations
      WHERE id = $1 AND deleted_at IS NULL
      FOR UPDATE
      `,
      [organizationId],
    );
    const organization = organizationResult.rows[0];
    if (!organization) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    if (organization.ownerId !== userId) {
      await client.query("ROLLBACK");
      return { status: "forbidden" };
    }

    await client.query(
      `
      UPDATE organizations
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [organizationId],
    );
    await client.query("COMMIT");
    return { status: "deleted" };
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
  updateOrganizationInDB,
  deleteOrganizationInDB,
};
