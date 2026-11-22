export interface IUserProfile {
  id: number;
  name: string | null;
  email: string;
  bio: string | null;
  address: string | null;
  phone: string | null;
  gender: string | null;
  avatarUrl: string | null;
}

export interface IUserProfileUpdate {
  name?: string;
  bio?: string;
  address?: string;
  phone?: string;
}

export interface IUpdatedUserProfile {
  id: number;
  name: string | null;
  bio: string | null;
  address: string | null;
  phone: string | null;
}

export interface IPublicUserProfile {
  id: number;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
}
