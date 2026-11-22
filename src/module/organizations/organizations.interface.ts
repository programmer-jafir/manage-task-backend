export interface ICreateOrganization {
  name: string;
  description: string;
}

export interface IOrganization {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  createdAt: Date;
}

export interface IOrganizationMembership {
  id: number;
  name: string;
  role: string;
}

export interface IOrganizationDetails {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  memberCount: number;
  createdAt: Date;
}

export interface IUpdateOrganization {
  name?: string;
  description?: string;
}

export interface IUpdatedOrganization {
  id: number;
  name: string;
  description: string;
}

export type TUpdateOrganizationResult =
  | { status: "updated"; organization: IUpdatedOrganization }
  | { status: "not_found" }
  | { status: "forbidden" };

export type TDeleteOrganizationResult =
  | { status: "deleted" }
  | { status: "not_found" }
  | { status: "forbidden" };
