import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import type { Court, CourtArea, Registrant, Slot } from "./session.types";

// Parser pur (HTML → Slot[]). Spécifique à pal-app, tolérant aux formats variables.
// Cœur fragile de la feature : en cas de changement du HTML, corrigeable via EAS Update.
// Aucun import react / react-native / @tanstack/react-query.
//
// SOURCE DES DONNÉES — le ClientState Telerik (vérifié en prod) : un blob JSON doublement encodé
// embarqué dans le HTML (`var s = {"resources":"[…]","appointments":"[…]"}`). Il est COMPLET :
// chaque `appointment` porte son court (`resources`), son type (`attributes._type`) et son sujet.
// On n'analyse donc plus le DOM des cartes `.rsApt` (qui ne relie pas une carte à son court — or
// le court par séance est indispensable, voir ci-dessous).
//
// MODÈLE (vérifié en prod) — sur une même PLAGE HORAIRE, un court area peut être SUBDIVISÉ en
// plusieurs séances occupant des courts différents (ex. parc 12:00–14:00 : courts 01–03 = groupe
// « 4.0_4.5 », courts 04–06 = groupe « 2.0C&T »). Chaque séance est un run de courts contigus :
//   - `BlockedTimeSlot` (un appointment par court occupé) → subject = CODE de niveau (« 3.5T »,
//     « 2.0C&T », « 4.0_4.5 », parfois en minuscule « 3.5c ») OU libellé spécial (« Jeu libre
//     public », « Jeu ouvert abonnés »…).
//   - `Reservation` AVEC l'attribut `_availableSpotLeft` (en tête de séance) → subject = NOMS des
//     inscrits (séparés par CRLF), `_availableSpotLeft` = places libres. Une `Reservation` SANS
//     cet attribut est une réservation individuelle privée → ignorée.
//   - `BookingHours` et plages vides → ignorées.

/** Une chaîne contient-elle un code de niveau (casse insensible) ? */
const LEVEL_CODE_RE = /[234]\.[05][ct]/i;

/**
 * Alias de libellés du site → code canonique du club. `pickleballenligne.com` n'affiche pas
 * toujours le code du club : le groupe le plus fort « 4.0C » apparaît comme l'intervalle
 * « 4.0_4.5 » (vérifié en prod, parc 12:00–14:00). Sans cet alias, ce subject ne matche aucun
 * code, tombe dans `labels`, et le créneau perd son niveau → invisible au filtre « mon niveau ».
 */
const CODE_ALIASES: { re: RegExp; code: LevelCode }[] = [{ re: /4\.0\s*_\s*4\.5/, code: "4.0C" }];

/** Codes canoniques portés par un subject via un alias d'intervalle (ex. « 4.0_4.5 » → « 4.0C »). */
const aliasCodes = (raw: string): LevelCode[] =>
  CODE_ALIASES.filter(({ re }) => re.test(raw)).map(({ code }) => code);

/** Le subject d'un bloc porte-t-il un code de niveau (vs un libellé de jeu libre) ? */
const hasLevelCode = (value: string): boolean =>
  LEVEL_CODE_RE.test(value) || aliasCodes(value).length > 0;

/** Extrait les codes de niveau, gérant « 2.5C & 2.5T », le raccourci « 2.0C&T » et la casse. */
const parseCodes = (raw: string): LevelCode[] => {
  const codes = new Set<LevelCode>();
  const add = (prefix: string, suffix: string) => {
    const code = `${prefix}${suffix.toUpperCase()}`;
    if (isLevelCode(code)) {
      codes.add(code);
    }
  };
  for (const match of raw.matchAll(/([234]\.[05])([ct])/gi)) {
    add(match[1], match[2]);
  }
  for (const match of raw.matchAll(/([234]\.[05])([ct])\s*&\s*([ct])\b/gi)) {
    add(match[1], match[2]);
    add(match[1], match[3]);
  }
  for (const code of aliasCodes(raw)) {
    codes.add(code);
  }
  return [...codes];
};

/** Découpe un subject « roster » (noms séparés par CRLF) en inscrits. */
const splitNames = (subject: string): Registrant[] =>
  subject
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((nom) => ({ nom }));

interface StateAppointment {
  subject?: string;
  start?: string;
  end?: string;
  resources?: { key?: string }[];
  attributes?: Record<string, string>;
}

const COURT_NUM_RE = /Court\s*0*(\d+)/i;
const hhmm = (value?: string): string | undefined => /(\d{1,2}:\d{2})/.exec(value ?? "")?.[1];

/** Regex de la propriété `appointments` du ClientState (valeur doublement encodée). */
const APPOINTMENTS_RE = /"appointments":"((?:\\.|[^"\\])*)"/;

/** Décode une valeur de ClientState doublement encodée en tableau ; `null` si illisible. */
const decodeState = <T>(encoded: string): T[] | null => {
  try {
    const parsed = JSON.parse(JSON.parse(`"${encoded}"`)) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
};

/**
 * Le HTML porte-t-il un ClientState exploitable (blob `appointments` présent ET décodable en
 * tableau) ? Sert à distinguer une grille vide LÉGITIME d'un format de données cassé (→ erreur).
 */
export const hasGridState = (html: string): boolean => {
  const match = APPOINTMENTS_RE.exec(html);
  return match ? decodeState(match[1]) !== null : false;
};

/**
 * Lit une propriété tableau du ClientState Telerik, doublement encodée :
 * `"appointments":"[{\"start\":…}]"`. Tolérant : tableau vide si la propriété est absente/illisible.
 */
const grabState = <T>(html: string, prop: string): T[] => {
  const match = new RegExp(`"${prop}":"((?:\\\\.|[^"\\\\])*)"`).exec(html);
  return match ? (decodeState<T>(match[1]) ?? []) : [];
};

interface Entry {
  /** Court le plus bas de l'entrée (pour le tri des runs). */
  courtNum: number;
  /** Tous les courts couverts par cet appointment. */
  courts: Court[];
  kind: "block" | "roster";
  /** Bloc : code/libellé. Roster : noms (CRLF). */
  subject: string;
  /** Roster uniquement : places libres (`_availableSpotLeft`). */
  free: number | null;
}

interface Session {
  courts: Court[];
  /** Code/libellé du (des) bloc(s) de la séance. */
  blockSubject: string | null;
  /** Noms bruts de la carte roster (CRLF), si présente. */
  rosterSubject: string | null;
  free: number | null;
  hasRoster: boolean;
}

const norm = (value: string): string => value.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Partitionne les entrées d'une plage horaire (triées par court) en séances contiguës.
 * Règle (vérifiée en prod) : une carte roster ouvre toujours une séance (elle est en tête de son
 * run de courts) ; un bloc dont le code diffère de celui de la séance courante en ouvre une autre.
 */
const buildSessions = (entries: Entry[]): Session[] => {
  const sorted = [...entries].sort((left, right) => left.courtNum - right.courtNum);
  const sessions: Session[] = [];
  let current: Session | null = null;
  const open = (): Session => {
    const session: Session = {
      courts: [],
      blockSubject: null,
      rosterSubject: null,
      free: null,
      hasRoster: false,
    };
    sessions.push(session);
    return session;
  };
  for (const entry of sorted) {
    if (entry.kind === "roster") {
      current = open();
      current.rosterSubject = entry.subject;
      current.free = entry.free;
      current.hasRoster = true;
    } else {
      const codeChanged =
        current !== null &&
        current.blockSubject !== null &&
        norm(current.blockSubject) !== norm(entry.subject);
      if (current === null || codeChanged) {
        current = open();
      }
      current.blockSubject ??= entry.subject;
    }
    current.courts.push(...entry.courts);
  }
  return sessions;
};

export const parseGrid = (html: string, courtArea: CourtArea): Slot[] => {
  // 1. court key → numéro de court (« 01 »).
  const courtByKey = new Map<string, string>();
  for (const resource of grabState<{ key?: string; text?: string }>(html, "resources")) {
    const num = resource.text ? COURT_NUM_RE.exec(resource.text)?.[1] : undefined;
    if (resource.key && num) {
      courtByKey.set(resource.key, num.padStart(2, "0"));
    }
  }
  const courtsOf = (appt: StateAppointment): Court[] =>
    (appt.resources ?? [])
      .map((resource) => (resource.key ? courtByKey.get(resource.key) : undefined))
      .filter((court): court is string => Boolean(court))
      .map((court) => court as Court);

  // 2. appointments → entrées (bloc / roster) regroupées par plage horaire.
  //    Une entrée = UN appointment (avec tous ses courts), pas un court : un roster couvrant
  //    plusieurs courts reste une seule carte logique (sinon il dupliquerait noms et places).
  const byRange = new Map<string, Entry[]>();
  const pushEntry = (range: string, entry: Entry) => {
    const list = byRange.get(range) ?? [];
    list.push(entry);
    byRange.set(range, list);
  };
  for (const appt of grabState<StateAppointment>(html, "appointments")) {
    const type = appt.attributes?._type;
    if (type !== "BlockedTimeSlot" && type !== "Reservation") {
      continue;
    }
    const start = hhmm(appt.start);
    const end = hhmm(appt.end);
    if (!start || !end) {
      continue;
    }
    const courts = courtsOf(appt);
    if (courts.length === 0) {
      continue;
    }
    const range = `${start} - ${end}`;
    const courtNum = Math.min(...courts.map(Number));

    if (type === "Reservation") {
      const spotLeft = appt.attributes?._availableSpotLeft;
      // Pas de `_availableSpotLeft` → réservation individuelle privée, hors séance de groupe.
      if (spotLeft === undefined) {
        continue;
      }
      const free = Number(spotLeft);
      pushEntry(range, {
        courtNum,
        courts,
        kind: "roster",
        subject: appt.subject ?? "",
        free: Number.isFinite(free) ? free : null,
      });
    } else {
      const subject = (appt.subject ?? "").replace(/\s+/g, " ").trim();
      if (!subject) {
        continue;
      }
      pushEntry(range, { courtNum, courts, kind: "block", subject, free: null });
    }
  }

  // 3. Par plage : une séance contiguë → un créneau (code + courts + roster propres).
  const slots: Slot[] = [];
  for (const [range, entries] of byRange) {
    const heure = /(\d{1,2}:\d{2})/.exec(range)?.[1] ?? "";
    const heureFin = /\d{1,2}:\d{2}\s*-\s*(\d{1,2}:\d{2})/.exec(range)?.[1] ?? "";
    for (const session of buildSessions(entries)) {
      const code = session.blockSubject;
      const codes = code && hasLevelCode(code) ? parseCodes(code) : [];
      const labels = code && !hasLevelCode(code) ? [code] : [];
      const inscrits = session.rosterSubject ? splitNames(session.rosterSubject) : [];

      // Une vraie séance porte un code, OU des inscrits, OU un libellé (jeu libre).
      // Une plage « N libres » non attribuée (ni code, ni nom, ni libellé) est ignorée.
      if (codes.length === 0 && inscrits.length === 0 && labels.length === 0) {
        continue;
      }

      const placesLibres = session.hasRoster ? (session.free === 0 ? null : session.free) : 0;
      slots.push({
        heure,
        heureFin,
        courtArea,
        terrains: [...new Set(session.courts)].sort() as Court[],
        kind: "groupe",
        codes,
        labels,
        inscrits,
        count: inscrits.length,
        placesLibres,
      });
    }
  }

  return slots;
};
