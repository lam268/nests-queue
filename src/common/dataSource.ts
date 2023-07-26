import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Video } from 'src/entities/video.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'LaM261019',
  database: 'hocmai',
  synchronize: true,
  entities: [Video],
});

export default dataSource;
