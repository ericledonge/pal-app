# Fixtures HTML — grille de présences

Échantillons pour tester le parser (`session.parser.ts`) et sa validation sans réseau.
**Noms anonymisés** (jamais de vraies données de joueurs dans le dépôt).

| Fichier | Description |
|---|---|
| `grid-parc-real.html` | Modélise la **structure réelle** de `pickleballenligne.com` (vérifiée en prod le 2026-06-24). Blocs : groupe `3.5T` avec roster, multi-groupes `2.5C & 2.5T`, `Complet` sans noms, code en minuscule `3.0T & 3.5c`, plus une `Réservée` et une plage `Libre` (qui ne doivent PAS produire de créneau). |
| `grid-empty.html` | Grille sans aucune carte (journée vide / aucun créneau). |
| `grid-degraded.html` | Markup dégradé : carte vide, carte sans heure, et raccourci multi-groupes compact `2.0C&T` — vérifie la tolérance. |

## Structure réelle d'un groupe (rappel important)

Pour une **même plage horaire**, le RadScheduler éclate un groupe en plusieurs cartes `div.rsApt` :

- **Carte roster** — `.appointment-card-type .caption` = `« N libres »` ou `« Complet »` ;
  `.appointment-card-subject` = **noms des inscrits** (séparés par retours-ligne).
- **Cartes « Bloquée »** (une par court occupé) — `.appointment-card-subject` = **code de niveau**
  (`3.5T`, `2.5T & 3.0C`, `2.0C&T`… parfois en **minuscule** `3.5c`).
- `.appointment-card-hours span` = plage `« 08:00 - 10:00 »` (clé de regroupement).

> ⚠️ L'attribut **`title`** de la carte est un **tooltip générique** (« Cette plage horaire n'est
> plus disponible… »), **jamais** le code — piège historique à l'origine d'un bug en prod.
> Le parser regroupe par plage horaire, prend le code des cartes « Bloquée » et le roster de la
> carte « libres ». Espaces encodés `&#32;`, retours-ligne `&#13;&#10;`, `&` en `&amp;`.
