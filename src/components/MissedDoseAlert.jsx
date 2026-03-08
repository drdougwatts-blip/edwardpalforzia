import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfDay, subDays, addDays, isAfter } from 'date-fns';

export default function MissedDoseAlert({ doses, latestVisit }) {
  const missedInfo = useMemo(() => {
    if (!latestVisit) return null;

    const today = startOfDay(new Date());
    const treatmentStart = latestVisit.date?.toDate
      ? startOfDay(latestVisit.date.toDate())
      : startOfDay(new Date(latestVisit.date));

    // Home dosing starts the day after the clinic visit
    const homeDoseStart = addDays(treatmentStart, 1);

    // Check last 14 days or since home dosing started, whichever is more recent
    // Exclude today — the dose hasn't been missed if the day isn't over yet
    const yesterday = subDays(today, 1);
    const rangeStart = isAfter(homeDoseStart, subDays(today, 13))
      ? homeDoseStart
      : subDays(today, 13);

    // If home dosing hasn't started yet (visit was today or yesterday with no past days), skip
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
