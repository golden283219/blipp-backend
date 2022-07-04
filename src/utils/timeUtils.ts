import dayjs from 'dayjs';
import {ReportType} from '../types/reportTypes';

export const getDaysBeforeDate = (days: number, date: Date = new Date()) => {
  const resultDate = date;
  resultDate.setDate(date.getDate() - days);
  return resultDate;
};

export const getReportTimeSpan = (reportType: ReportType) =>
  reportType === 'X' ? getXReportHours() : getZReportHours();

const getXReportHours = () => {
  const now = dayjs();
  const startDate = now.set('hours', 5).set('minutes', 0).set('seconds', 0);

  return {startDate: startDate.toISOString(), endDate: now.toISOString()};
};
const getZReportHours = () => {
  const now = dayjs();
  const startDate = now
    .subtract(1, 'day')
    .set('hours', 5)
    .set('minutes', 0)
    .set('seconds', 0);
  const endDate = now.set('hour', 5).set('minutes', 0).set('seconds', 0);

  return {startDate: startDate.toISOString(), endDate: endDate.toISOString()};
};

export const convertToLocalTime = (date: string, timezone: string) =>
  dayjs.utc(date).tz(timezone).format('YYYY-MM-DD HH:mm');
