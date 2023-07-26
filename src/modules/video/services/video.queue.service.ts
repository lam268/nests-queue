import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class VideoQueueService {
  constructor(@InjectQueue('video') private videoQueue: Queue) {}

  async addVideoToDownloadQueue(videoUrl: string, videoId: string) {
    try {
      this.videoQueue.add('download', {
        url: videoUrl,
        videoId: videoId,
      });
    } catch (error) {
      console.log('Error in add download queue', error);
    }
  }
}
