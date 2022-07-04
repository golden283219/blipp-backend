import puppeteer from 'puppeteer';

export async function generatePdf(
  template: string,
  id: number,
  appDir: string,
  subject: string
) {
  const filename = `${subject} - ${id}.pdf`;
  const config =  process.env.PUPPETEER_EXECUTABLE_PATH ? {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  } : {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  try {
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    await page.setContent(template);
    await page.emulateMediaType('screen');
    await page.pdf({
      path: `${appDir}/pdf/${filename}`,
      format: 'a4',
      printBackground: true,
    });
    await browser.close();
    return filename;
  } catch (error) {
    console.log(error);
  }
}
