export const getLocalDateString = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const isPastDate = (dateString) =>
  Boolean(dateString) && dateString < getLocalDateString();

export const isFutureDate = (dateString) =>
  Boolean(dateString) && dateString > getLocalDateString();
