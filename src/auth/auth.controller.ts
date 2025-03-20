import { Body, Controller, Post, SetMetadata } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LoginDto } from "../user/dto/login.dto";
import { CreateUserDto } from "../user/dto/user.create-dto";
import { LoginUserDto } from "../user/dto/user.login-dto";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("register")
  @SetMetadata("isPublic", true) // Set as public route
  @ApiOperation({
    summary: "Register a new user and return user details with JWT",
  })
  @ApiResponse({ status: 200, description: "User registered successfully." })
  createUser(@Body() user: CreateUserDto): Promise<any> {
    return this.userService.createUser(user);
  }

  @Post("login")
  @SetMetadata("isPublic", true) // Set as public route
  @ApiOperation({ summary: "Login with email and password to get JWT token" })
  @ApiResponse({
    status: 200,
    description: "Login successful, returns JWT token",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto): Promise<LoginUserDto> {
    return this.authService.login(loginDto);
  }
}
