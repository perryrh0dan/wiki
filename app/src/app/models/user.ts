export class User {
  _id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  rights: [];
  masterrole: string;
  authenticators: [];
  createdAt: Date;
  updatedAt: Date;
}
