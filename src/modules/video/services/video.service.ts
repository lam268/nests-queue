import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/constant';
import { IVideo } from 'src/interface';
import { Repository } from 'typeorm';
import { Video } from '../../../entities/video.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video) private videoRepository: Repository<Video>,
  ) {}

  async getVideoByVideoId(videoId: string) {
    try {
      return await this.videoRepository.findOne({
        where: {
          videoId: videoId,
        },
      });
    } catch (error) {
      console.log('Error in get video by video id', error);
    }
  }

  async assignVideo(video: IVideo) {
    try {
      const createVideo = await this.videoRepository.create({
        videoId: video.videoId,
        videoUrl: video.url,
        status: Status.ASSIGNED,
      });
      return await this.videoRepository.save(createVideo);
    } catch (error) {
      console.log('Error in assign video', error);
    }
  }

  async updateStatus(videoId: string, status: Status, errorMessage?: string) {
    try {
      const video = await this.videoRepository.findOne({
        where: {
          videoId: videoId,
        },
      });
      await this.videoRepository.update(video.id, {
        ...video,
        status: status,
        errorMessage: errorMessage,
      });
    } catch (error) {
      console.log('Error in update video status', error);
    }
  }
}
