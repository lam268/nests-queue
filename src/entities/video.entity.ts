import { Status } from 'src/constant';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'video' })
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 2000,
    nullable: false,
  })
  videoUrl: string;

  @Column({
    type: 'varchar',
    length: 2000,
    nullable: false,
  })
  videoId: string;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
  })
  status: Status;

  @Column({
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  errorMessage: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
