import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigModuleOptions } from '@nestjs/config';

@Module({})
export class ConfigModule {
	static forRoot(options: ConfigModuleOptions): Promise<DynamicModule> {
		return NestConfigModule.forRoot(options);
	}
}
