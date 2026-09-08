export default function getCurrentMonthAndYear() {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  return `${monthName} ${year}`;
}
