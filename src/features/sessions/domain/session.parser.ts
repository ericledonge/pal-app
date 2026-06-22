import { parse } from "node-html-parser";

import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import type { Plateau, Slot, SlotKind } from "./session.types";

// Parser pur (HTML → Slot[]). Spécifique à pal-app, tolérant aux formats variables.
// Cœur fragile de la feature : en cas de changement du HTML, corrigeable via EAS Update.
// Aucun import react / react-native / @tanstack/react-query.
//
// Limite connue : l'association créneau → court(s) (colonnes du RadScheduler) n'est pas
// encore reconstruite (terrains = []). Heure, plateau, niveau, compte et noms le sont.

const SPECIAL_LABELS = ["Open Play", "Jeu libre public", "Groupe ouvert"];

/** Décode les entités utiles pour que les sélecteurs de classe et les codes fonctionnent. */
const normalize = (html: string): string => html.replace(/&#32;/g, " ").replace(/&amp;/g, "&");

/** Extrait les codes de niveau, gérant « 2.5C & 2.5T » et le raccourci « 2.0C&T ». */
const parseCodes = (raw: string): LevelCode[] => {
  const codes = new Set<LevelCode>();
  for (const match of raw.matchAll(/([234]\.[05])([CT])/g)) {
    const code = `${match[1]}${match[2]}`;
    if (isLevelCode(code)) {
      codes.add(code);
    }
  }
  for (const match of raw.matchAll(/([234]\.[05])([CT])\s*&\s*([CT])\b/g)) {
    for (const suffix of [match[2], match[3]]) {
      const code = `${match[1]}${suffix}`;
      if (isLevelCode(code)) {
        codes.add(code);
      }
    }
  }
  return [...codes];
};

const detectKind = (caption: string, hasNames: boolean): SlotKind => {
  if (/bloqu/i.test(caption)) {
    return "bloquee";
  }
  if (/r[ée]serv/i.test(caption)) {
    return "reservee";
  }
  if (/\d+\s*libres/i.test(caption)) {
    return "groupe";
  }
  if (/libre/i.test(caption)) {
    return "libre";
  }
  return hasNames ? "groupe" : "nd";
};

export const parseGrid = (html: string, plateau: Plateau): Slot[] => {
  const root = parse(normalize(html));
  const slots: Slot[] = [];

  for (const apt of root.querySelectorAll(".rsApt")) {
    try {
      const title = apt.getAttribute("title") ?? "";
      const caption = apt.querySelector(".appointment-card-type .caption")?.text.trim() ?? "";
      const hours = apt.querySelector(".appointment-card-hours")?.text.trim() ?? "";
      const heure = /(\d{1,2}:\d{2})/.exec(hours)?.[1] ?? "";
      const labelText = apt.querySelector(".appointment-card-label")?.text.trim() ?? "";
      const subject = apt.querySelector(".appointment-card-subject")?.text ?? "";

      const inscrits = subject
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .map((nom) => ({ nom }));

      const codes = parseCodes(title);

      const labels = new Set<string>();
      if (labelText) {
        labels.add(labelText);
      }
      for (const special of SPECIAL_LABELS) {
        if (title.includes(special) || subject.includes(special)) {
          labels.add(special);
        }
      }

      // Ignore proprement une carte totalement vide (markup inattendu / placeholder).
      if (!heure && !caption && codes.length === 0 && inscrits.length === 0) {
        continue;
      }

      slots.push({
        heure,
        plateau,
        terrains: [],
        kind: detectKind(caption, inscrits.length > 0),
        codes,
        labels: [...labels],
        inscrits,
        count: inscrits.length,
      });
    } catch {
      // Tolérant : une carte au markup inattendu est ignorée sans faire échouer le parsing.
    }
  }

  return slots;
};
