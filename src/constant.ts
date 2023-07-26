import * as Joi from 'joi';

export const regexUrl =
  /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;

export const RefreshToken = 'refresh_token';

export const videoSchema = Joi.object().keys({
  videoId: Joi.string().required(),
  url: Joi.string().regex(regexUrl).required(),
});

export const loginSchema = Joi.object().keys({
  userName: Joi.string().required(),
  password: Joi.string().required(),
});

export enum Status {
  ASSIGNED = 'ASSIGNED',
  DOWNLOADED = 'DOWNLOADED',
  PRE_PROCESS = 'PRE_PROCESSED',
  FAILED = 'FAILED',
  DONE = 'DONE',
}
