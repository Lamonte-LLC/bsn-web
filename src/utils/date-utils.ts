import moment from 'moment';

export const yesterday = (date: Date | string): string => {
  const matchDate = moment(date).hour(0).minute(0).second(0).millisecond(0);
  const yesterdayDate = matchDate.subtract(1, 'day');
  return yesterdayDate.format('YYYY-MM-DD');
};

export const isToday = (date: Date | string): boolean => {
  const today = moment().hour(0).minute(0).second(0).millisecond(0);
  const matchDate = moment(date).hour(0).minute(0).second(0).millisecond(0);
  return today.isSame(matchDate, 'day');
};

export const isNowBeforeNoon = (): boolean => {
  const today = moment();
  const noon = moment().hour(12).minute(0).second(0).millisecond(0);
  return today.isBefore(noon);
};

export const isBeforeToday = (date: Date | string): boolean => {
  const today = moment().hour(0).minute(0).second(0).millisecond(0);
  const matchDate = moment(date).hour(0).minute(0).second(0).millisecond(0);
  return matchDate.isBefore(today, 'day');
};

export const isAfterToday = (date: Date | string): boolean => {
  const today = moment().hour(0).minute(0).second(0).millisecond(0);
  const matchDate = moment(date).hour(0).minute(0).second(0).millisecond(0);
  return matchDate.isAfter(today, 'day');
};
