import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './services/app.service';
import { BullModule } from '@nestjs/bull';
import { Video } from './entities/video.entity';
import { Result } from './entities/result.entity';
import { join } from 'path';
import { VideoQueueService } from './modules/video/services/video.queue.service';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { VideoService } from './modules/video/services/video.service';
import { UserToken } from './entities/userToken.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './services/user.service';
import { DatabaseService } from './common/databaseService';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.registerQueue({
      name: 'video',
      redis: {
        host: 'localhost',
        port: 55001,
        password: 'redispw',
      },
      processors: [
        {
          name: 'download',
          path: join(
            __dirname,
            'modules/video/processors/download.processor.js',
          ),
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'LaM261019',
      database: 'hocmai',
      autoLoadEntities: true,
      entities: [Video, Result, User, UserToken],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Video, Result, User, UserToken]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    VideoQueueService,
    AuthService,
    VideoService,
    JwtService,
    ConfigService,
    UserService,
    DatabaseService,
  ],
})
export class AppModule {}
