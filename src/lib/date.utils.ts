// Utilitaires date/heure transverses. Les créneaux F1 manipulent des heures « HH:MM » (texte) ;
// pour comparer à « maintenant » avec une marge (en minutes), on convertit en minutes depuis minuit.

/** Convertit « HH:MM » en minutes depuis minuit (ex. « 18:30 » → 1110). `null` si non exploitable. */
export const toMinutes = (hhmm: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
};

/** Minutes écoulées depuis minuit pour l'instant donné (défaut : maintenant). Lit l'horloge locale. */
export const nowMinutes = (now: Date = new Date()): number =>
  now.getHours() * 60 + now.getMinutes();

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** Clé de date locale « YYYY-MM-DD » (composantes locales, sans dépendance à un fuseau via Intl). */
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
