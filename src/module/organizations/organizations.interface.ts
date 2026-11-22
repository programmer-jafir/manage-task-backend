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
