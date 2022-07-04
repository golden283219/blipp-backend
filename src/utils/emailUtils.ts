import nodemailer from 'nodemailer';
import {EmailSubjectUnion} from '../types/emailTypes';
import {convertToLocalTime} from './timeUtils';

export const sendPdfEmail = async (
  receiverEmail: string,
  subject: string,
  filename: string,
  appDir: string,
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT!,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: receiverEmail,
    subject,
    attachments: [
      {
        filename,
        path: `${appDir}/pdf/${filename}`,
        contentType: 'application/pdf',
      },
    ],
  });
};

export const createEmailSubject = (type: EmailSubjectUnion, date: string, timezone: string) => {
  const time = convertToLocalTime(date, timezone)
  return `${type} - ${time}`
};
