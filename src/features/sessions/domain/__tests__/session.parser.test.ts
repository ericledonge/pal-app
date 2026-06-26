import { parseGrid } from "../session.parser";

// Le parser lit le ClientState Telerik (blob JSON doublement encodé) embarqué dans le HTML.
// `buildGrid` reconstruit ce blob à partir d'appointments — c'est la frontière non fiable testée.
// Données calquées sur la prod (parc/patinoire, vérifiées en juin 2026).

interface Appt {
  subject: string;
  start: string;
  end: string;
  resources: { key: string }[];
  attributes: Record<string, string>;
}

const at = (hhmm: string): string => `2026/06/27 ${hhmm}`;

const block = (
  court: string,
  subject: string,
  range: [string, string] = ["12:00", "14:00"],
): Appt => ({
  subject,
  start: at(range[0]),
  end: at(range[1]),
  resources: [{ key: `k${court}` }],
  attributes: { _type: "BlockedTimeSlot" },
});

const roster = (
  court: string,
  names: string,
  free: number,
  range: [string, string] = ["12:00", "14:00"],
): Appt => ({
  subject: names,
  start: at(range[0]),
  end: at(range[1]),
  resources: [{ key: `k${court}` }],
  attributes: { _type: "Reservation", _availableSpotLeft: String(free) },
});

const privateRes = (
  court: string,
  names: string,
  range: [string, string] = ["12:00", "14:00"],
): Appt => ({
  subject: names,
  start: at(range[0]),
  end: at(range[1]),
  resources: [{ key: `k${court}` }],
  attributes: { _type: "Reservation" }, // pas de _availableSpotLeft → résa individuelle
});

const bookingHours = (court: string, range: [string, string]): Appt => ({
  subject: "",
  start: at(range[0]),
  end: at(range[1]),
  resources: [{ key: `k${court}` }],
  attributes: { _type: "BookingHours" },
});

// Encodage double du ClientState Telerik (chaîne JSON dont le contenu est lui-même du JSON).
const enc = (value: unknown): string => JSON.stringify(JSON.stringify(value));

const buildGrid = (appointments: Appt[]): string => {
  const keys = [...new Set(appointments.flatMap((a) => a.resources.map((r) => r.key)))];
  const resources = keys.map((k) => ({ key: k, text: `Court ${k.replace(/^k/, "")}` }));
  return `<div class="RadScheduler"><div class="appointments"></div><script>var s = {"resources":${enc(resources)},"appointments":${enc(appointments)}};</script></div>`;
};

describe("parseGrid — séances et codes", () => {
  it("assemble code (blocs) et roster (Reservation) d'une même séance, avec ses courts", () => {
    const slots = parseGrid(
      buildGrid([
        roster("01", "Marie-Josée Paquet\r\nReginald Nappert", 28, ["08:00", "10:00"]),
        block("02", "2.5T", ["08:00", "10:00"]),
        block("03", "2.5T", ["08:00", "10:00"]),
        block("04", "2.5T", ["08:00", "10:00"]),
        block("05", "2.5T", ["08:00", "10:00"]),
      ]),
      "parc",
    );
    expect(slots).toHaveLength(1);
    expect(slots[0].codes).toEqual(["2.5T"]);
    expect(slots[0].courtArea).toBe("parc");
    expect(slots[0].kind).toBe("groupe");
    expect(slots[0].heure).toBe("08:00");
    expect(slots[0].heureFin).toBe("10:00");
    expect(slots[0].terrains).toEqual(["01", "02", "03", "04", "05"]);
    expect(slots[0].inscrits.map((r) => r.nom)).toEqual(["Marie-Josée Paquet", "Reginald Nappert"]);
    expect(slots[0].count).toBe(2);
    expect(slots[0].placesLibres).toBe(28);
  });

  it("reconnaît les codes multi-groupes « 2.5C & 2.5T »", () => {
    const slots = parseGrid(buildGrid([block("01", "2.5C & 2.5T")]), "parc");
    expect(slots[0].codes).toEqual(expect.arrayContaining(["2.5C", "2.5T"]));
  });

  it("normalise la casse (« 3.5c & 3.5T » → « 3.5C », « 3.5T »)", () => {
    const slots = parseGrid(buildGrid([block("01", "3.5c & 3.5T")]), "parc");
    expect(slots[0].codes).toEqual(expect.arrayContaining(["3.5C", "3.5T"]));
  });

  it("développe le raccourci compact « 2.0C&T » → « 2.0C » + « 2.0T »", () => {
    const slots = parseGrid(buildGrid([block("01", "2.0C&T")]), "patinoire");
    expect(slots[0].codes).toEqual(expect.arrayContaining(["2.0C", "2.0T"]));
  });

  it("mappe l'alias d'intervalle « 4.0_4.5 » vers le code « 4.0C » (et non un libellé)", () => {
    const slots = parseGrid(buildGrid([block("01", "4.0_4.5")]), "parc");
    expect(slots[0].codes).toEqual(["4.0C"]);
    expect(slots[0].labels).toEqual([]);
  });

  it("émet une séance de jeu libre (libellé non-code) avec 0 code", () => {
    const slots = parseGrid(
      buildGrid([roster("01", "Gaston Provost", 5), block("02", "Jeu ouvert abonnés")]),
      "parc",
    );
    expect(slots).toHaveLength(1);
    expect(slots[0].codes).toEqual([]);
    expect(slots[0].labels).toContain("Jeu ouvert abonnés");
    expect(slots[0].inscrits.map((r) => r.nom)).toEqual(["Gaston Provost"]);
  });

  it("gère « Complet » (roster plein : places libres = 0, 0 nom listé) : code présent", () => {
    const slots = parseGrid(buildGrid([roster("01", "", 0), block("02", "2.5T")]), "parc");
    expect(slots).toHaveLength(1);
    expect(slots[0].codes).toEqual(["2.5T"]);
    expect(slots[0].count).toBe(0);
    expect(slots[0].placesLibres).toBeNull();
  });
});

describe("parseGrid — court area subdivisé (plusieurs séances sur une même plage)", () => {
  it("découpe en une séance par groupe, chacune avec SES propres courts (sans roster)", () => {
    // Parc samedi 12:00–14:00 (vérifié en prod) : courts 01–03 « 4.0_4.5 », 04–06 « 2.0C&T ».
    const slots = parseGrid(
      buildGrid([
        block("01", "4.0_4.5"),
        block("02", "4.0_4.5"),
        block("03", "4.0_4.5"),
        block("04", "2.0C&T"),
        block("05", "2.0C&T"),
        block("06", "2.0C&T"),
      ]),
      "parc",
    );
    expect(slots).toHaveLength(2);
    const fort = slots.find((s) => s.codes.includes("4.0C"));
    expect(fort?.codes).toEqual(["4.0C"]);
    expect(fort?.terrains).toEqual(["01", "02", "03"]);
    const faible = slots.find((s) => s.codes.includes("2.0C"));
    expect(faible?.codes).toEqual(expect.arrayContaining(["2.0C", "2.0T"]));
    expect(faible?.terrains).toEqual(["04", "05", "06"]);
  });

  it("découpe deux séances avec chacune SON roster (rattaché par run de courts contigus)", () => {
    // Patinoire 08:00–10:00 (vérifié en prod) : roster 07 / blocs 08–09 « 2.5C » ;
    // roster 10 / bloc 11 « 2.0C&T ». Chaque roster est en tête de son run de courts.
    const slots = parseGrid(
      buildGrid([
        roster("07", "Suzanne Collin", 17, ["08:00", "10:00"]),
        block("08", "2.5C", ["08:00", "10:00"]),
        block("09", "2.5C", ["08:00", "10:00"]),
        roster("10", "Mireille Fortier", 11, ["08:00", "10:00"]),
        block("11", "2.0C&T", ["08:00", "10:00"]),
      ]),
      "patinoire",
    );
    expect(slots).toHaveLength(2);
    const a = slots.find((s) => s.codes.includes("2.5C"));
    expect(a?.terrains).toEqual(["07", "08", "09"]);
    expect(a?.inscrits.map((r) => r.nom)).toEqual(["Suzanne Collin"]);
    expect(a?.placesLibres).toBe(17);
    const b = slots.find((s) => s.codes.includes("2.0C"));
    expect(b?.terrains).toEqual(["10", "11"]);
    expect(b?.inscrits.map((r) => r.nom)).toEqual(["Mireille Fortier"]);
    expect(b?.placesLibres).toBe(11);
  });
});

describe("parseGrid — plages ignorées", () => {
  it("ignore une réservation individuelle (Reservation sans _availableSpotLeft)", () => {
    const slots = parseGrid(
      buildGrid([block("01", "3.0C"), block("02", "3.0C"), privateRes("03", "Jean Privé")]),
      "parc",
    );
    expect(slots).toHaveLength(1);
    expect(slots[0].terrains).toEqual(["01", "02"]);
    const names = slots.flatMap((s) => s.inscrits.map((r) => r.nom));
    expect(names).not.toContain("Jean Privé");
  });

  it("ignore un roster « N libres » non attribué (ni code, ni nom, ni libellé)", () => {
    expect(parseGrid(buildGrid([roster("01", "", 30)]), "parc")).toHaveLength(0);
  });

  it("ignore les plages BookingHours (sans contenu de séance)", () => {
    expect(parseGrid(buildGrid([bookingHours("01", ["16:00", "17:00"])]), "parc")).toHaveLength(0);
  });

  it("ClientState absent ou HTML vide → aucun créneau (sans crash)", () => {
    expect(parseGrid('<div class="RadScheduler"></div>', "parc")).toHaveLength(0);
    expect(parseGrid("", "parc")).toHaveLength(0);
  });

  it("n'invente pas d'inscrit à partir d'un code (« 3.5T » n'est pas un nom)", () => {
    const slots = parseGrid(buildGrid([block("01", "3.5T")]), "parc");
    const names = slots.flatMap((s) => s.inscrits.map((r) => r.nom));
    expect(names).not.toContain("3.5T");
  });

  it("ClientState présent mais JSON corrompu → aucun créneau (branche catch, sans crash)", () => {
    const corrupt =
      '<div class="RadScheduler"><script>var s={"resources":"[]","appointments":"[{"};</script></div>';
    expect(parseGrid(corrupt, "parc")).toHaveLength(0);
  });
});

describe("parseGrid — cas de bordure (couverture)", () => {
  it("développe un appointment couvrant plusieurs courts en un seul créneau", () => {
    const multiBlock: Appt = {
      subject: "2.5T",
      start: at("12:00"),
      end: at("14:00"),
      resources: [{ key: "k01" }, { key: "k02" }, { key: "k03" }],
      attributes: { _type: "BlockedTimeSlot" },
    };
    const slots = parseGrid(buildGrid([multiBlock]), "parc");
    expect(slots).toHaveLength(1);
    expect(slots[0].codes).toEqual(["2.5T"]);
    expect(slots[0].terrains).toEqual(["01", "02", "03"]);
  });

  it("un roster couvrant plusieurs courts reste UNE séance (pas de duplication des inscrits)", () => {
    const multiRoster: Appt = {
      subject: "Alice Tremblay\r\nBob Roy",
      start: at("12:00"),
      end: at("14:00"),
      resources: [{ key: "k01" }, { key: "k02" }],
      attributes: { _type: "Reservation", _availableSpotLeft: "5" },
    };
    const slots = parseGrid(buildGrid([multiRoster, block("03", "2.5T")]), "parc");
    expect(slots).toHaveLength(1);
    expect(slots[0].codes).toEqual(["2.5T"]);
    expect(slots[0].terrains).toEqual(["01", "02", "03"]);
    expect(slots[0].inscrits.map((r) => r.nom)).toEqual(["Alice Tremblay", "Bob Roy"]);
    expect(slots[0].count).toBe(2);
    expect(slots[0].placesLibres).toBe(5);
  });

  it("traite un _availableSpotLeft non numérique comme places inconnues (« Complet »)", () => {
    const broken: Appt = {
      subject: "Alice Tremblay",
      start: at("12:00"),
      end: at("14:00"),
      resources: [{ key: "k01" }],
      attributes: { _type: "Reservation", _availableSpotLeft: "abc" },
    };
    const slots = parseGrid(buildGrid([broken, block("02", "2.5T")]), "parc");
    expect(slots).toHaveLength(1);
    expect(slots[0].placesLibres).toBeNull();
    expect(slots[0].inscrits.map((r) => r.nom)).toEqual(["Alice Tremblay"]);
  });
});
