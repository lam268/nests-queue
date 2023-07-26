import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from 'src/entities/result.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Result) private resultRepository: Repository<Result>,
  ) {}

  async getResult() {
    try {
      const resultList = await this.resultRepository.find();
      return resultList;
    } catch (error) {
      console.log('Error in get result', error);
    }
  }
}
