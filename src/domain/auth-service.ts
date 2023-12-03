import { AuthRepository } from "../repositories/authRepositori";

export class AuthService {
  authQueryRepository : AuthRepository
  constructor() {
    this.authQueryRepository = new AuthRepository()
  }
 
}
