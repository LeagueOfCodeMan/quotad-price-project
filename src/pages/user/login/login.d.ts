type LoginResultType = string;

interface LoginResultType {
  id: number;
  identity: number;
  username: string;
  is_superuser: boolean;
  data_joined: Date;
  last_login: Date;
  real_name: string;
  company: string;
  addr: string;
  duty: string;
  email: string;
  tel: string;
  area: null | string;

  [propNmae: string]: any;
}

export = LoginResultType;

export interface LoginPayload {
  username: string;
  password: string;
  type?: string;
}
