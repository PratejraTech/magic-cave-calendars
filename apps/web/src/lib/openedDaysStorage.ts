type OpenedDayMap = Record<number, string>;

const STORAGE_KEY = 'advent-opened-days';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadOpenedDayMap(): OpenedDayMap {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as OpenedDayMap;
    return parsed;
  } catch {
    return {};
  }
}

export function persistOpenedDay(dayId: number, openedAt: string) {
  if (!canUseStorage()) {
    return;
  }

  const data = loadOpenedDayMap();
  data[dayId] = openedAt;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetOpenedDays() {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
