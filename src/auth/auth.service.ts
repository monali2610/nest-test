import { Injectable, forwardRef, NotFoundException } from "@nestjs/common";
import { Inject } from "@nestjs/common/decorators";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserEntity } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { LoginDto } from "../user/dto/login.dto";
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // generate JWT
  generateJWT(user: any): Promise<string> {
    return this.jwtService.signAsync({ user });
  }

  // has password
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // compare password
  comparePassword(newPassword: string, passwordHash: string): boolean {
    return bcrypt.compareSync(newPassword, passwordHash);
  }

  // validate user
  async validateUser(email: string, password: string): Promise<UserEntity> {
    try {
      const findUser: UserEntity = await this.userService.findUserByEmail(
        email
      );
      if (!this.comparePassword(password, findUser.password)) return null;
      return findUser;
    } catch (err) {
      console.log(err);
    }
  }

  // POST -> login
  async login(loginUser: LoginDto): Promise<any> {
    const user = await this.validateUser(loginUser.email, loginUser.password);

    if (!user) {
      throw new NotFoundException(
        `There is no user with email (${loginUser.email})`
      );
    }
    // Create a payload for the JWT token
    const payload = { username: user.email, sub: user.id };

    // Generate a JWT token
    const token = await this.generateJWT(payload);

    // Return JWT token along with user details (excluding password)
    const { password, ...userData } = user; // Exclude password from the response
    return {
      user: userData,
      token: token,
    };
  }
}
