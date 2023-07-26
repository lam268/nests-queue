import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ConfigKey from 'src/config-key';
import { UserToken } from '../entities/userToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   *
   * @param user
   * @return accessToken & accessTokenExpiredIn
   */
  private generateAccessToken(user: User) {
    const accessTokenExpiredIn = this.configService.get(
      ConfigKey.TOKEN_EXPIRED_IN,
    );
    const secretAccessTokenKey = this.configService.get(
      ConfigKey.JWT_SECRET_ACCESS_TOKEN_KEY,
    );
    const accessTokenOptions = {
      secret: secretAccessTokenKey,
      expiresIn: accessTokenExpiredIn,
    };
    const payloadAccessToken = {
      id: user.id,
      userName: user.userName,
      expiresIn: accessTokenExpiredIn,
    };
    const accessToken = this.jwtService.sign(
      payloadAccessToken,
      accessTokenOptions,
    );
    return {
      token: accessToken,
      expiresIn: accessTokenExpiredIn,
    };
  }
  /**
   *
   * @param user
   * @param hashToken
   * @return refreshToken && refreshTokenExpiredIn
   */
  private generateRefreshToken(user: User, hashToken: string) {
    const refreshTokenExpiredIn = this.configService.get(
      ConfigKey.REFRESH_TOKEN_EXPIRED_IN,
    );
    const secretRefreshTokenKey = this.configService.get(
      ConfigKey.JWT_SECRET_REFRESH_TOKEN_KEY,
    );
    const accessTokenOptions = {
      secret: secretRefreshTokenKey,
      expiresIn: refreshTokenExpiredIn,
    };

    const payloadAccessToken = {
      id: user.id,
      userName: user.userName,
      expiresIn: refreshTokenExpiredIn,
      hashToken,
    };
    const refreshToken = this.jwtService.sign(
      payloadAccessToken,
      accessTokenOptions,
    );
    return {
      token: refreshToken,
      expiresIn: refreshTokenExpiredIn,
    };
  }

  private generateHashToken(userId: number): string {
    const random = Math.floor(Math.random() * (10000 - 1000) + 1000);
    return `${userId}-${Date.now()}-${random}`;
  }

  async refreshToken(user: User) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const accessToken = this.generateAccessToken(user);
      const hashToken = this.generateHashToken(user.id);
      const refreshToken = this.generateRefreshToken(user, hashToken);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // delete old refresh token
      await queryRunner.manager.delete(UserToken, { user });
      // add refresh token to user_tokens table.
      await queryRunner.manager.save(UserToken, {
        user,
        token: refreshToken.token,
        hashToken,
      });
      await queryRunner.release();
      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async checkHashToken(token: string) {
    try {
      const data = await this.jwtService.verify(token, {
        secret: this.configService.get(ConfigKey.JWT_SECRET_REFRESH_TOKEN_KEY),
      });
      const res = await this.userTokenRepository.findOne({
        where: {
          hashToken: data.hashToken,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  async login(user: User) {
    try {
      const accessToken = this.generateAccessToken(user);
      const hashToken = this.generateHashToken(user.id);
      const refreshToken = this.generateRefreshToken(user, hashToken);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // add refresh token to user_tokens table.
      await queryRunner.manager.save(UserToken, {
        user,
        token: refreshToken.token,
        hashToken,
      });
      await queryRunner.release();
      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log('Error in login', error);
    }
  }
}
