import _ from 'lodash';
import {OpeningHours} from '../models/opening-hours.model';
import {AllWeekdays} from '../types';

export const timeCheck = (uniqueList: OpeningHours[]) => {
  const regex = /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/;
  return uniqueList.filter(day => {
    if (!regex.test(day.closingHour!)) return false;
    if (!regex.test(day.openingHour!)) return false;
    return true;
  });
};

export const dayCheck = (openingHours: OpeningHours[]) => {
  const validDays = openingHours.filter(day =>
    Object.values(AllWeekdays).includes(day.day!),
  );
  return _.uniqBy(validDays, 'day');
};

export const openingHoursHandler = (openingHours: OpeningHours[]) => {
  if (!openingHours) return AllWeekdays.map(day => new OpeningHours({day}));

  const uniqueDays = dayCheck(openingHours);
  const validDays = timeCheck(uniqueDays);

  const daysNotSet = AllWeekdays.filter(
    x => !validDays.map(day => day.day).includes(x),
  );

  const remainingDays = daysNotSet.map(day => new OpeningHours({day}));

  return [...validDays, ...remainingDays];
};
