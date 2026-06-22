import type { Court, Plateau } from "./session.types";

// URLs publiques de la grille de réservation (même club `gi`, un `li` par plateau,
// suffixe `contentOnly` pour le fragment HTML sans habillage).
export const PLATEAU_URLS: Record<Plateau, string> = {
  parc: "https://pickleballenligne.com/PublicFront/Locations/LocationBooking.aspx?gi=57b1795f-27c9-4fba-a146-aaede7bc32e4&li=5ae8a235-b6cf-4e47-94fc-0a15fd831136&contentOnly",
  patinoire:
    "https://pickleballenligne.com/PublicFront/Locations/LocationBooking.aspx?gi=57b1795f-27c9-4fba-a146-aaede7bc32e4&li=3fc4bef4-a5e7-4895-9767-1e1e22428459&contentOnly",
};

/** Capacité maximale par plateau (sert d'indice ; on compte plutôt les noms listés). */
export const PLATEAU_MAX_CAPACITY: Record<Plateau, number> = {
  parc: 36,
  patinoire: 30,
};

export const COURTS_BY_PLATEAU: Record<Plateau, readonly Court[]> = {
  parc: ["01", "02", "03", "04", "05", "06"],
  patinoire: ["07", "08", "09", "10", "11"],
};

export const PLATEAU_LABELS: Record<Plateau, string> = {
  parc: "Parc",
  patinoire: "Patinoire",
};
