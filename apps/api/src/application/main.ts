import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from '../shared/filters/prisma-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors();
	app.setGlobalPrefix('api');
	app.useGlobalFilters(new PrismaExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle('OVGS API')
		.setDescription('Sistema de Gestão de Ordens de Venda')
		.setVersion('0.1.0')
		.addTag('ovgs')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	const port = process.env.PORT ?? 3001;
	await app.listen(port);
}

void bootstrap();
