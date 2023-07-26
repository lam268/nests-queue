import { DoneCallback, Job } from 'bull';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as download from 'download';
import { exec } from 'child_process';
import dataSource from '../../../common/dataSource';
import { DatabaseService } from 'src/common/databaseService';
import { Video } from '../../../entities/video.entity';
import { Status } from 'src/constant';
import 'reflect-metadata';
dotenv.config();

export default async function (job: Job, cb: DoneCallback) {
  await dataSource
    .initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });
  const databaseService = new DatabaseService(dataSource.manager);
  const { data } = job;
  console.log(data.videoId);
  const savedRecord = await databaseService.findOne(
    Video,
    'videoId',
    data.videoId,
  );
  if (!savedRecord) cb(null, 'Error in process');
  if (savedRecord) {
    // Stage 1: Download File
    try {
      // Video will be stored at this path
      exec(`mkdir ${process.env.FILE_PATH}/${data.videoId}`);
      const path = `${process.env.FILE_PATH}/${data.videoId}/${data.videoId}.mp4`;
      fs.writeFileSync(path, await download(data.url));
      const tempData = {
        ...savedRecord,
        status: Status.DOWNLOADED,
      };
      await databaseService.updateOne(Video, savedRecord.id, tempData);
      console.log('Download Complete');
    } catch (error) {
      const tempData = {
        ...savedRecord,
        errorMessage: error,
        status: Status.FAILED,
      };
      await databaseService.updateOne(Video, savedRecord.id, tempData);
      console.log('Error in download file');
      cb(error, 'Error in download file');
    }
    // Stage 2: Pre process
    exec(
      `python3 ${process.env.FILE_SCRIPT_PATH}/pre-process.py ${data.videoId}`,
      async (error, stdout, stderr) => {
        if (error) {
          const tempData = {
            ...savedRecord,
            errorMessage: error,
            status: Status.FAILED,
          };
          await databaseService.updateOne(Video, savedRecord.id, tempData);
          cb(error, 'Error in pre process file');
          process.exit(1);
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`);
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`);
        }
      },
    );
    const tempData = {
      ...savedRecord,
      status: Status.PRE_PROCESS,
    };
    await databaseService.updateOne(Video, savedRecord.id, tempData);
    console.log('Pre-process Completed');
    // Stage 3: Process video
  }
}
