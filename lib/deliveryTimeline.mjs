// Calendar dates in the store's timezone, independent of the visitor's timezone.
export function getDeliveryTimeline(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now);
  const value = (type) => Number(parts.find((part) => part.type === type).value);
  const today = Date.UTC(value('year'), value('month') - 1, value('day'));
  const at = (offset) => new Date(today + offset * 86400000);
  const month = (date) => new Intl.DateTimeFormat('en-US', {
    month: 'short', timeZone: 'UTC',
  }).format(date);
  const day = (date) => String(date.getUTCDate()).padStart(2, '0');
  const format = (date) => `${month(date)} ${day(date)}`;
  const range = (start, end) => start.getUTCMonth() === end.getUTCMonth()
    && start.getUTCFullYear() === end.getUTCFullYear()
    ? `${format(start)} - ${day(end)}`
    : `${format(start)} - ${format(end)}`;

  return {
    purchasedText: format(at(0)),
    processingText: range(at(0), at(1)),
    deliveredText: range(at(4), at(5)),
  };
}
