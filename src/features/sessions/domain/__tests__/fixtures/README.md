# Fixtures HTML — grille de présences

Échantillons pour tester le parser (`session.parser.ts`) et sa validation sans réseau.

| Fichier | Origine | Description |
|---|---|---|
| `grid-parc-real.html` | **parc, aujourd'hui** — capturé le 2026-06-22 sur `pickleballenligne.com` (allégé : scripts/styles retirés, 45 cartes `rsApt` réelles) | Cas réels : « X libres » + noms, « Bloquée », « Réservée », libellé « limite », codes simples et **multi-groupes** (attribut `title` du `div.rsApt`, ex. `3.0C &#32;&amp;&#32; 3.0T`) |
| `grid-empty.html` | Forgée | Grille sans aucune carte (journée vide / aucun créneau) |
| `grid-degraded.html` | Forgée | Markup volontairement dégradé : carte sans heure ni sujet, carte vide, écriture multi-groupes compacte `2.0C&amp;T` — vérifie la tolérance du parser |

## Structure d'une carte (rappel)

- `div.rsApt.rsAptColor` — attribut **`title`** = code(s) de groupe / libellé (ex. `3.0C & 3.0T`).
- `.appointment-card-type .caption` — `« X libres »` (plage de groupe avec liste) · `« Bloquée »` · `« Réservée »`.
- `.appointment-card-hours span` — plage horaire `« 08:00 - 10:00 »`.
- `.appointment-card-label span` — libellé spécial (`« limite »`, etc.).
- `.appointment-card-subject span` — **noms des inscrits**, séparés par retours-ligne (le nombre de noms = nombre d'inscrits).

> Les espaces dans les attributs sont encodés `&#32;` et les retours-ligne `&#13;&#10;` — le parser doit les décoder.
