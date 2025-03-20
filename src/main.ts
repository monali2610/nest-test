import { ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as morgan from "morgan";
import { AppModule } from "./app.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("NestJS PostgreSQL example")
    .setDescription("API description")
    .setVersion("1.0")
    .addBearerAuth() // This adds Bearer Auth to Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("api", app, document);

  app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
  app.use(morgan("tiny"));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
