import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  SetMetadata,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/user.update-dto";
import { UserEntity } from "./entity/user.entity";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default is 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of users per page (default is 10)",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User list found." })
  findUserList(
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ): Promise<UserEntity[]> {
    return this.userService.findAll(page, limit);
  }

  @Get("/search")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User list found." })
  findUserByEmail(@Query("email") email: string): Promise<UserEntity> {
    return this.userService.findUserByEmail(email);
  }

  @Patch("restore/:email")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User restored successfully." })
  async restoreUser(@Param("email") email: string): Promise<void> {
    await this.userService.restoreUserById(email);
  }

  @Get("/:userId")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User details found." })
  findUserById(@Param("userId") userId: number): Promise<UserEntity> {
    return this.userService.findUserById(userId);
  }

  @Patch("/:userId")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User Updated successfully." })
  updateUserById(
    @Param("userId") userId: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UpdateResult> {
    return this.userService.updateUserById(userId, updateUserDto);
  }

  @Delete(":id")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 200, description: "User removed successfully." })
  async deleteUser(@Param("id") id: number): Promise<any> {
    await this.userService.removeUserById(id);
  }
}
