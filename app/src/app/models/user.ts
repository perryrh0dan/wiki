export class User {
  _id: String;
  email: String;
  password: String;
  name: String;
  roles: String[];
  rights: [];
  masterrole: String;
  authenticators: [];
  createdAt: Date;
  updatedAt: Date;
}
