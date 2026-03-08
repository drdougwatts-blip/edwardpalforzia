import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfDay, subDays, isAfter } from 'date-fns';

export default function MissedDoseAlert({ doses, latestVisit }) {
  const missedInfo = useMemo(() => {
    if (!latestVisit) return null;

    const today = startOfDay(new Date());
    const treatmentStart = latestVisit.date?.toDate
      ? startOfDay(latestVisit.date.toDate())
      : startOfDay(new Date(latestVisit.date));

    // Check last 14 days or since treatment start, whichever is more recent
    // Exclude today — the dose hasn't been missed if the day isn't over yet
    const yesterday = subDays(today, 1);
    const rangeStart = isAfter(treatmentStart, subDays(today, 13))
      ? treatmentStart
      : subDays(today, 13);

    // If treatment started today, there are no past days to check yet
    if (isAfter(rangeStart, yesterday)) return null;

    const days = eachDayOfInterval({ start: rangeStart, end: yesterday });

    const doseDates = new Set(
      doses.map(d => {
        const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
        return format(startOfDay(date), 'yyyy-MM-dd');
      })
    );

    const missedDays = days.filter(day => !doseDates.has(format(day, 'yyyy-MM-dd')));

    // Calculate consecutive missed days from today going backwards
    let consecutiveMissed = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const dayStr = format(days[i], 'yyyy-MM-dd');
      if (!doseDates.has(dayStr)) {
        consecutiveMissed++;
      } else {
        break;
      }
    }

    return {
      totalMissed: missedDays.length,
      consecutiveMissed,
      missedDays: missedDays.map(d => format(d, 'dd MMM')),
      longestGap: consecutiveMissed // simplified
    };
  }, [doses, latestVisit]);

  if (!missedInfo || missedInfo.consecutiveMissed === 0) return null;

  let alertClass = 'alert-info';
  let message = '';

  if (missedInfo.consecutiveMissed >= 3) {
    alertClass = 'alert-danger';
    message = `${missedInfo.consecutiveMissed} consecutive doses missed — contact the clinic before resuming. Dose adjustment may be required.`;
  } else if (missedInfo.consecutiveMissed === 2) {
    alertClass = 'alert-warning';
    message = '2 consecutive doses missed — check protocol guidelines.';
  } else {
    alertClass = 'alert-info';
    message = 'No dose logged for yesterday.';
  }

  return (
    <div className={`alert ${alertClass}`}>
      <strong>⚠ Missed Dose Alert:</strong> {message}
    </div>
  );
}
