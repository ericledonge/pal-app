import { type HTMLElement, parse } from "node-html-parser";

import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import type { Court, Plateau, Registrant, Slot } from "./session.types";

// Parser pur (HTML → Slot[]). Spécifique à pal-app, tolérant aux formats variables.
// Cœur fragile de la feature : en cas de changement du HTML, corrigeable via EAS Update.
// Aucun import react / react-native / @tanstack/react-query.
//
// Modèle réel du RadScheduler (vérifié en prod) : pour une même PLAGE HORAIRE, le groupe est
// éclaté en plusieurs cartes `.rsApt` :
//   - une carte « roster » (caption « N libres » ou « Complet ») dont `.appointment-card-subject`
//     liste les NOMS des inscrits ;
//   - plusieurs cartes « Bloquée » (une par court occupé) dont le subject est le CODE de niveau
//     (« 3.5T », « 2.5T & 3.0C », « 2.0C&T »… parfois en minuscule « 3.5c »).
// L'attribut `title` de la carte est un tooltip générique, JAMAIS le code. On regroupe donc les
// cartes par plage horaire et on assemble un seul créneau (code + roster) par groupe.

const normalize = (html: string): string => html.replace(/&#32;/g, " ").replace(/&amp;/g, "&");

/** Une plage contient-elle un code de niveau (casse insensible) ? */
const LEVEL_CODE_RE = /[234]\.[05][ct]/i;
const hasLevelCode = (value: string): boolean => LEVEL_CODE_RE.test(value);

/** Caption d'une carte « roster » : « N libres » (avec un nombre) ou « Complet ». Pas « Libre » seul. */
const isRosterCaption = (caption: string): boolean =>
  /\d+\s*libres/i.test(caption) || /complet/i.test(caption);

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
  return [...codes];
};

const splitNames = (subject: string): Registrant[] =>
  subject
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((nom) => ({ nom }));

interface RawCard {
  range: string;
  start: string;
  caption: string;
  subject: string;
}

interface StateAppointment {
  start?: string;
  end?: string;
  subject?: string;
  resources?: { key?: string }[];
}

const COURT_NUM_RE = /Court\s*0*(\d+)/i;
const hhmm = (value?: string): string | undefined => /(\d{1,2}:\d{2})/.exec(value ?? "")?.[1];

/**
 * Extrait, depuis le ClientState Telerik embarqué dans le HTML, la liste des courts par plage
 * horaire. La propriété est doublement encodée : `"appointments":"[{\"start\":…}]"`.
 * Renvoie une map « 08:00 - 10:00 » → { "01", "02"… }. Tolérant : map vide si le JSON est absent.
 */
const extractCourtsByRange = (html: string): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  const grab = <T>(prop: string): T[] => {
    const match = new RegExp(`"${prop}":"((?:\\\\.|[^"\\\\])*)"`).exec(html);
    if (!match) {
      return [];
    }
    try {
      return JSON.parse(JSON.parse(`"${match[1]}"`)) as T[];
    } catch {
      return [];
    }
  };

  const courtByKey = new Map<string, string>();
  for (const resource of grab<{ key?: string; text?: string }>("resources")) {
    const num = resource.text ? COURT_NUM_RE.exec(resource.text)?.[1] : undefined;
    if (resource.key && num) {
      courtByKey.set(resource.key, num.padStart(2, "0"));
    }
  }

  for (const appt of grab<StateAppointment>("appointments")) {
    // Ignore les plages sans contenu (n/d / Libre) : elles ne font pas partie de la séance.
    if (!appt.subject?.trim()) {
      continue;
    }
    const start = hhmm(appt.start);
    const end = hhmm(appt.end);
    if (!start || !end) {
      continue;
    }
    const range = `${start} - ${end}`;
    const courts = map.get(range) ?? new Set<string>();
    for (const resource of appt.resources ?? []) {
      const court = resource.key ? courtByKey.get(resource.key) : undefined;
      if (court) {
        courts.add(court);
      }
    }
    map.set(range, courts);
  }

  return map;
};

const readCard = (apt: HTMLElement): RawCard | null => {
  const hours =
    apt.querySelector(".appointment-card-hours")?.text.replace(/\s+/g, " ").trim() ?? "";
  const start = /(\d{1,2}:\d{2})/.exec(hours)?.[1] ?? "";
  if (!start) {
    return null;
  }
  return {
    range: hours,
    start,
    caption: apt.querySelector(".appointment-card-type .caption")?.text.trim() ?? "",
    subject: apt.querySelector(".appointment-card-subject")?.text ?? "",
  };
};

export const parseGrid = (html: string, plateau: Plateau): Slot[] => {
  const root = parse(normalize(html));
  const courtsByRange = extractCourtsByRange(html);

  // 1. Regroupe les cartes par plage horaire complète (« 08:00 - 10:00 »).
  const byRange = new Map<string, RawCard[]>();
  for (const apt of root.querySelectorAll(".rsApt")) {
    try {
      const card = readCard(apt);
      if (!card) {
        continue;
      }
      const list = byRange.get(card.range) ?? [];
      list.push(card);
      byRange.set(card.range, list);
    } catch {
      // Tolérant : une carte au markup inattendu est ignorée sans faire échouer le parsing.
    }
  }

  // 2. Assemble un créneau par groupe. Les cartes « Bloquée » portent soit un CODE de niveau,
  //    soit un libellé spécial (« Jeu libre public », « Jeu ouvert abonnés »…). Le roster vient
  //    de la carte « N libres » / « Complet ».
  const slots: Slot[] = [];
  for (const [range, cards] of byRange) {
    const codes: LevelCode[] = [];
    const seenCode = new Set<LevelCode>();
    const labels: string[] = [];
    const seenLabel = new Set<string>();
    for (const card of cards) {
      if (!/bloqu/i.test(card.caption)) {
        continue;
      }
      if (hasLevelCode(card.subject)) {
        for (const code of parseCodes(card.subject)) {
          if (!seenCode.has(code)) {
            seenCode.add(code);
            codes.push(code);
          }
        }
      } else {
        const label = card.subject.replace(/\s+/g, " ").trim();
        if (label && !seenLabel.has(label)) {
          seenLabel.add(label);
          labels.push(label);
        }
      }
    }

    const rosterCard = cards.find((card) => isRosterCaption(card.caption));
    const inscrits = rosterCard ? splitNames(rosterCard.subject) : [];

    // Une vraie séance porte un code de niveau, OU des inscrits, OU un libellé (jeu libre).
    // Une plage « N libres » vide (créneau non encore attribué) est ignorée.
    if (codes.length === 0 && inscrits.length === 0 && labels.length === 0) {
      continue;
    }

    const terrains = [...(courtsByRange.get(range) ?? [])].sort() as Court[];
    slots.push({
      heure: rosterCard?.start ?? cards[0].start,
      plateau,
      terrains,
      kind: "groupe",
      codes,
      labels,
      inscrits,
      count: inscrits.length,
    });
  }

  return slots;
};
