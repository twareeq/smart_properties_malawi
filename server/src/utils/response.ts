import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  meta?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  errors?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    errors,
  });
};
