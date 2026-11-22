import { pool } from "../../db";
import type {
  IUpdatedUserProfile,
  IPublicUserProfile,
  IUserProfile,
  IUserProfileUpdate,
} from "./user.interface";

const getPublicUserProfileFromDB = async (
  id: number,
): Promise<IPublicUserProfile | null> => {
  const result = await pool.query<IPublicUserProfile>(
    `
    SELECT id, name, bio, avatar_url AS "avatarUrl"
    FROM users
    WHERE id = $1 AND is_active = true
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const getUserProfileFromDB = async (
  id: number,
): Promise<IUserProfile | null> => {
  const result = await pool.query<IUserProfile>(
    `
    SELECT id, name, email, bio, address, phone, gender, avatar_url AS "avatarUrl"
    FROM users
    WHERE id = $1 AND is_active = true
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const updateUserProfileInDB = async (
  id: number,
  updates: IUserProfileUpdate,
): Promise<IUpdatedUserProfile | null> => {
  const columns: Record<keyof IUserProfileUpdate, string> = {
    name: "name",
    bio: "bio",
    address: "address",
    phone: "phone",
  };
  const values: (string | number)[] = [];
  const assignments: string[] = [];

  for (const field of Object.keys(columns) as (keyof IUserProfileUpdate)[]) {
    const value = updates[field];
    if (value !== undefined) {
      values.push(value);
      assignments.push(`${columns[field]} = $${values.length}`);
    }
  }

  values.push(id);
  const result = await pool.query<IUpdatedUserProfile>(
    `
    UPDATE users
    SET ${assignments.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length} AND is_active = true
    RETURNING id, name, bio, address, phone
    `,
    values,
  );

  return result.rows[0] ?? null;
};

export const userService = {
  getPublicUserProfileFromDB,
  getUserProfileFromDB,
  updateUserProfileInDB,
};
