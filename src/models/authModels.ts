
export type LoginInputModel = {
  loginOrEmail: string,
  password: string
}

export type AuthViewModel = {
  email: string,
  login: string,
  userId: string,
}

export class AuthViewModelType {
  constructor(
   public email: string,
   public login: string,
   public userId: string,
   ) { }
  }   
