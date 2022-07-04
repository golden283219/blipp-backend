import fs from 'fs';
import path from 'path';
import {sendPdfEmail} from '../utils/emailUtils';
import {generatePdf} from '../utils/pdfUtils';

export const pdfEmailService = async (
  template: string,
  entetyId: number,
  email: string,
  subject: string,
) => {
  const appDir = path.dirname(require.main!.filename);
  const filename = await generatePdf(template, entetyId, appDir, subject);

  if (!filename) return null;
  try {
    await sendPdfEmail(email, subject, filename, appDir);
    fs.unlinkSync(`${appDir}/pdf/${filename}`);
    return null;
  } catch (error) {
    fs.unlinkSync(`${appDir}/pdf/${filename}`);
    console.log(error);
    return null;
  }
};
