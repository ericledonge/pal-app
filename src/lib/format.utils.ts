// Formatage en locale française (Québec) : heure 24 h, accents corrects.
const LOCALE = "fr-CA";

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Heure au format 24 h, ex. « 18:00 ». */
export const formatTime = (date: Date): string => timeFormatter.format(date);

/** Date longue en français, ex. « samedi 21 juin ». */
export const formatDate = (date: Date): string => dateFormatter.format(date);

export const formatNumber = (value: number): string => new Intl.NumberFormat(LOCALE).format(value);
