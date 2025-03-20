import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({
    description: "The name of the user",
    example: "John Doe",
    default: "John Doe", // Default value in Swagger documentation
  })
  @IsString()
  readonly name: string;
  @ApiProperty({
    description: "The email of the user",
    example: "john.doe@example.com",
    default: "john.doe@example.com", // Default value in Swagger documentation
  })
  @IsEmail()
  readonly email: string;
  @ApiProperty({
    description: "The password of the user",
    example: "admin@123",
    default: "admin@123", // Default value in Swagger documentation
  })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
