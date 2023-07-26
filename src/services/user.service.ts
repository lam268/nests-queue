import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findUserByUsername(userName: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          userName: userName,
        },
      });
      return user;
    } catch (error) {
      console.log('Error in find user', error);
    }
  }
}
