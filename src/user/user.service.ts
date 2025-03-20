import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.service";
import { IsNull, Not, Repository, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/user.create-dto";
import { UpdateUserDto } from "./dto/user.update-dto";
import { UserEntity } from "./entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly authService: AuthService
  ) {}

  // POST -> Create user
  async createUser(user: CreateUserDto): Promise<any> {
    const { email, password, name } = user;
    const findUser: UserEntity = await this.userRepository.findOne({
      where: { email },
    });
    if (findUser)
      throw new ConflictException(
        `${email} is already created user. Create another user.`
      );
    const hashPassword: string = await this.authService.hashPassword(password);
    const newUser = {
      email,
      name,
      password: hashPassword,
    };
    const savedUser = await this.userRepository.save(newUser);
    const payload = { username: savedUser.email, sub: savedUser.id };

    const token = await this.authService.generateJWT(payload);

    return {
      user: savedUser,
      token: token,
    };
  }

  // GET -> get user
  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit, // Skip records based on the page
      take: limit, // Take the number of records specified in limit
    });
    return {
      data: users,
      totalCount: total, // Total number of users available
      page,
      limit,
      totalPages: Math.ceil(total / limit), // Calculate total pages
    };
  }

  // GET -> get user using id
  async findUserById(id: number): Promise<UserEntity> {
    const selectedUser: UserEntity = await this.userRepository.findOne({
      where: { id },
    });
    if (!selectedUser)
      throw new NotFoundException(`There is no user with ID ${id}`);
    return selectedUser;
  }

  // GET -> get user using email
  async findUserByEmail(email: string): Promise<UserEntity> {
    const selectedUser: UserEntity = await this.userRepository.findOne({
      where: { email },
    });
    if (!selectedUser)
      throw new NotFoundException(`There is no user with email (${email})`);
    return selectedUser;
  }

  // PATCH -> update user using id
  async updateUserById(
    userId: number,
    updateUserDto: UpdateUserDto
  ): Promise<any> {
    if (!userId) {
      throw new NotFoundException(`Enter user ID`);
    }

    const user: UserEntity = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`There is no user with ID ${userId}`);
    }
    if (user.deletedAt) {
      throw new Error(`User with user id ${userId} is already soft-deleted`);
    }
    await this.userRepository.update(userId, updateUserDto);

    return user;
  }

  // DELETE -> delete user using id
  async removeUserById(id: number): Promise<string> {
    if (!id) {
      throw new NotFoundException(`Enter user ID`);
    }

    const user: UserEntity = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`There is no user with ID ${id}`);
    }

    // Soft delete: update the deletedAt field with the current timestamp
    user.deletedAt = new Date();

    await this.userRepository.save(user); // Save the updated user with deletedAt set

    return "Remove user successfully!";
  }

  // RESTORE -> restore a soft deleted user
  async restoreUserById(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (!user.deletedAt) {
      throw new Error(`User with email ${email} is not soft-deleted`);
    }

    // Restore the soft-deleted user
    user.deletedAt = null;
    await this.userRepository.save(user);
  }
}
