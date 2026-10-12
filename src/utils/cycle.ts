import { WeeklyCycleInfo } from '../types';

/**
 * Calculates current cycle information based on Wednesday 05:00 AM (Thai time UTC+7)
 * A cycle starts Wednesday 05:00:00 AM and ends next Wednesday 04:59:59 AM.
 */
export function calculateWednesdayCycleInfo(baseDate: Date = new Date()): WeeklyCycleInfo {
  // Convert current time to Thai time (UTC+7)
  const utc = baseDate.getTime() + (baseDate.getTimezoneOffset() * 60000);
  const thaiNow = new Date(utc + (7 * 3600000));

  const dayOfWeek = thaiNow.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const hours = thaiNow.getHours();

  // Determine when current cycle started
  let daysSinceWedReset = 0;
  if (dayOfWeek === 3) { // Wednesday
    if (hours >= 5) {
      daysSinceWedReset = 0;
    } else {
      daysSinceWedReset = 7; // Last week Wednesday
    }
  } else if (dayOfWeek > 3) {
    daysSinceWedReset = dayOfWeek - 3;
  } else {
    daysSinceWedReset = dayOfWeek + 4; // Sun=4, Mon=5, Tue=6
  }

  // Current cycle start time in Thai Date
  const cycleStartThai = new Date(thaiNow);
  cycleStartThai.setDate(thaiNow.getDate() - daysSinceWedReset);
  cycleStartThai.setHours(5, 0, 0, 0);

  // Next reset date in Thai Date
  const nextResetThai = new Date(cycleStartThai);
  nextResetThai.setDate(cycleStartThai.getDate() + 7);

  // Milliseconds remaining until next reset
  const msRemaining = Math.max(0, nextResetThai.getTime() - thaiNow.getTime());

  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Unique Cycle Key format: e.g. "CYCLE_YYYY_MM_DD_0500"
  const y = cycleStartThai.getFullYear();
  const m = String(cycleStartThai.getMonth() + 1).padStart(2, '0');
  const d = String(cycleStartThai.getDate()).padStart(2, '0');
  const cycleKey = `CYCLE_${y}_${m}_${d}_0500`;

  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const monthName = months[cycleStartThai.getMonth()];
  const thaiYear = cycleStartThai.getFullYear() + 543;
  const dateLabel = `รอบวันพุธที่ ${cycleStartThai.getDate()} ${monthName} ${thaiYear} เวลา 05:00 น.`;

  return {
    cycleKey,
    cycleStartThai,
    nextResetThai,
    msRemaining,
    days,
    hours: hoursRemaining,
    minutes,
    seconds,
    dateLabel,
  };
}
