import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

const ADELAIDE_TIMEZONE = 'Australia/Adelaide';

export const getAdelaideDate = (): Date => {
  const now = new Date();
  const zonedTime = utcToZonedTime(now, ADELAIDE_TIMEZONE);
  return zonedTime;
};
