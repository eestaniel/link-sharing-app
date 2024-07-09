import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule} from "@nestjs/cache-manager"
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/module/users.module';
import { AuthModule } from './auth/module/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule], // Use ConfigModule if CacheModule depends on it
      useFactory: async () => ({
        ttl: 3600000,
        // other options like max size, store type etc.
      }),
    }),
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
