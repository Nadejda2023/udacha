import { AuthQueryRepository } from "../repositories/authQueryRepositorii";

export class AuthService {
  authQueryRepository : AuthQueryRepository
  constructor() {
    this.authQueryRepository = new AuthQueryRepository()
  }
 
}
