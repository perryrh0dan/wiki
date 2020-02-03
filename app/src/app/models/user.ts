export class User {
  _id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  rights: [];
  settings: any;
  masterrole: string;
  authenticators: [];
  createdAt: Date;
  updatedAt: Date;
}
