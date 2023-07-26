import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './services/app.service';
import { JoiValidationPipe } from './pipes';
import { ILogin, IVideo } from './interface';
import { loginSchema, videoSchema } from './constant';
import { VideoQueueService } from './modules/video/services/video.queue.service';
import { AuthService } from './services/auth.service';
import { VideoService } from './modules/video/services/video.service';
import { JwtGuard } from './jwtGuard';
import * as bcrypt from 'bcrypt';
import { UserService } from './services/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly videoQueueService: VideoQueueService,
    private readonly authService: AuthService,
    private readonly videoService: VideoService,
    private readonly userService: UserService,
  ) {}

  @Post('/analysis-request')
  @UseGuards(JwtGuard)
  async processFile(@Body(new JoiValidationPipe(videoSchema)) body: IVideo) {
    try {
      const existedVideo = await this.videoService.getVideoByVideoId(
        body.videoId,
      );
      if (existedVideo) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Existed video id',
        };
      }
      const createVideo = await this.videoService.assignVideo(body);
      this.videoQueueService.addVideoToDownloadQueue(body.url, body.videoId);
      return createVideo;
    } catch (error) {
      throw error;
    }
  }

  @Post('/login')
  async login(@Body(new JoiValidationPipe(loginSchema)) body: ILogin) {
    try {
      const user = await this.userService.findUserByUsername(body.userName);
      if (!user) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        };
      }
      const isValidPassword = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isValidPassword) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        };
      }
      const {
        user: profile,
        accessToken,
        refreshToken,
      } = await this.authService.login(user);
      return {
        profile,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/refresh-token')
  @UseGuards(JwtGuard)
  async refreshToken(@Request() req) {
    try {
      const user = req.loginUser.id;
      const {
        user: profile,
        accessToken,
        refreshToken,
      } = await this.authService.refreshToken(user);
      return {
        profile,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/analysis-request')
  @UseGuards(JwtGuard)
  async getProcessedResults() {
    try {
      return await this.appService.getResult();
    } catch (error) {
      throw error;
    }
  }
}
