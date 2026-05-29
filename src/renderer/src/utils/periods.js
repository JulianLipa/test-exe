export const calculatePeriods = (start, end, intervalMonths) => {
  if (!start || !end || !intervalMonths) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  // diferencia en meses total
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months <= 0) return 0;

  return Math.floor(months / Number(intervalMonths));
};
