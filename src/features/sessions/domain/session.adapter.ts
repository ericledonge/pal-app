import { HttpError, httpGet, httpPostForm } from "@/lib/http";

import { PLATEAU_URLS } from "./session.constants";
import type { Plateau } from "./session.types";

// Frontière IO : renvoie le HTML brut de la grille. Aucun parsing métier ici
// (l'extraction des champs cachés ci-dessous est de la mécanique de postback ASP.NET).

/** « Aujourd'hui » : simple GET sur l'URL du plateau. */
export const fetchTodayGrid = async (plateau: Plateau): Promise<string> => {
  const { body } = await httpGet(PLATEAU_URLS[plateau]);
  return body;
};

const decodeEntities = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)));

/** Extrait tous les `<input type="hidden">` en couples name → value (valeur HTML décodée). */
const extractHiddenInputs = (html: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const match of html.matchAll(/<input\b[^>]*type="hidden"[^>]*>/gi)) {
    const tag = match[0];
    const name = /name="([^"]*)"/i.exec(tag)?.[1];
    if (!name) {
      continue;
    }
    fields[name] = decodeEntities(/value="([^"]*)"/i.exec(tag)?.[1] ?? "");
  }
  return fields;
};

/** UniqueID du scheduler (pour `__EVENTTARGET`), dérivé de son id racine `..._BookingScheduler`. */
const extractSchedulerTarget = (html: string): string | null => {
  const id = /id="([^"]*BookingScheduler)"/i.exec(html)?.[1];
  return id ? id.replace(/_/g, "$") : null;
};

/**
 * « Demain » : postback Telerik RadScheduler en deux temps.
 * GET (récolte les champs cachés + cookies de session), puis POST renvoyant tous les
 * champs tels quels, en n'écrasant que `__EVENTTARGET` et `__EVENTARGUMENT`. Le ViewState
 * chiffré n'étant pas fabricable, l'approche en deux temps est obligatoire.
 */
export const fetchTomorrowGrid = async (plateau: Plateau): Promise<string> => {
  const url = PLATEAU_URLS[plateau];
  const { body: getBody, cookies } = await httpGet(url);

  const target = extractSchedulerTarget(getBody);
  if (!target) {
    throw new HttpError("http", `Contrôle BookingScheduler introuvable (${plateau}).`);
  }

  const fields = extractHiddenInputs(getBody);
  fields.__EVENTTARGET = target;
  fields.__EVENTARGUMENT = JSON.stringify({ Command: "NavigateToNextPeriod" });

  const formBody = Object.entries(fields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const { body } = await httpPostForm(url, formBody, { cookies });
  return body;
};
