# Fiche store & soumission (FR-CA)

Cible : francophones du Québec. Tous les textes en **français (FR-CA)**. Identifiant : `ca.palevis.app`.

## Métadonnées

| Champ | Valeur | Limite |
|---|---|---|
| Nom (App Store / Play) | **Pickleball Action Lévis** | 30 |
| Sous-titre (App Store) | Présences et matrices de jeu | 30 |
| Brève description (Play) | Présences du club et générateur de matrices de jeu pour le pickleball. | 80 |
| Mots-clés (App Store) | `pickleball,Lévis,présences,sessions,matrice,doubles,club,minuteur,terrains,niveaux` | 100 |
| Catégorie | Sports | — |
| Classification | 4+ / Tout public | — |

### Description (App Store & Play — version longue)

> **L'appli du club Pickleball Action Lévis.**
>
> Consultez en un coup d'œil qui joue aujourd'hui et demain, sur les terrains du parc (01–06) et de la patinoire (07–11). Filtrez par votre niveau pour ne voir que les créneaux qui vous concernent.
>
> **Présences**
> • Sessions d'aujourd'hui et de demain, par plateau et par terrain
> • Filtre « mon niveau » (les neuf groupes, de 2.0C à 4.0C)
> • Liste des personnes inscrites à chaque créneau
> • Tiré à rebours du calendrier officiel du club
>
> **Matrices de jeu**
> • Génère des appariements de doubles sur place, en faisant tourner partenaires et adversaires
> • Gère les bancs équitablement
> • Minuteur de match (13 minutes par défaut, réglable)
>
> Les inscriptions aux sessions restent gérées par courriel — l'application sert uniquement à consulter les présences et à animer les matchs sur place. Aucun compte requis.

> Note : l'application ne gère pas les inscriptions (elles restent par courriel). Mentionner ce point évite les rejets de revue pour fonctionnalité attendue manquante.

## Notes de revue & autorisation (anti-rejet 5.2.2)

Le risque de rejet le plus probable n'est pas la vie privée mais le **scraping d'un service tiers**
(Apple 5.2.2) : l'app lit et réaffiche le contenu de `pickleballenligne.com`. La parade — autorisation
écrite du club + notes de revue à coller dans les stores — est détaillée dans
[`AUTORISATION.md`](AUTORISATION.md).

À ne pas oublier au moment de soumettre :

- **App Store Connect → App Review Information → Notes** : coller le texte FR/EN de `AUTORISATION.md`
  (aucun compte requis, données issues du calendrier public du club, app compagnon autorisée).
- **Play Console → App access** : déclarer « All functionality is available without special access ».
- Tenir prête l'**autorisation écrite du club** (Apple peut la demander).

## Captures d'écran

À produire depuis un **dev/preview build** sur simulateur iOS et émulateur Android (les captures sont prises via l'outil Argent `screenshot` ou la capture native du simulateur), en **clair et en sombre**.

Scènes recommandées (5) : Agenda (mon niveau), Détail d'un créneau (inscrits), Matrice en direct (appariements + bancs), Minuteur de match, Profil.

| Store | Appareil | Résolution | Quantité |
|---|---|---|---|
| App Store | iPhone 6.9" (requis) | 1320×2868 ou 1290×2796 | 3–10 |
| App Store | iPhone 6.5" (recommandé) | 1284×2778 ou 1242×2688 | 3–10 |
| Play Store | Téléphone | 1080×1920 (9:16), PNG/JPEG | 2–8 |

Orientation **portrait** uniquement (l'app est portrait-only).

## Politique de confidentialité

- Texte : [`docs/PRIVACY.md`](PRIVACY.md).
- **URL publique** (GitHub Pages, source `main` / dossier `/docs`) : **`https://ericledonge.github.io/pal-app/privacy.html`** (page HTML autonome `docs/privacy.html` ; `docs/index.html` redirige la racine vers elle ; `.nojekyll` sert les fichiers tels quels).

## Formulaire de confidentialité (App Privacy / Data Safety)

Cohérent avec l'architecture : **aucun compte, aucun backend**. Données techniques uniquement, et **seulement si les clés sont configurées** (Sentry/Amplitude sont désactivés en l'absence de `EXPO_PUBLIC_*`).

| Donnée | Outil | Finalité | Liée à l'identité | Suivi publicitaire |
|---|---|---|---|---|
| Données de plantage / performance | Sentry | Diagnostics | Non | Non |
| Interactions produit (événements d'usage) | Amplitude | Analytics | Non | Non |
| Identifiant d'appareil | Amplitude | Analytics | Non | Non |

- **App Privacy (Apple)** : « Données collectées non liées à vous » → *Diagnostics* (Crash Data, Performance Data) + *Données d'utilisation* (Product Interaction) + *Identifiants* (Device ID). Aucun *Tracking*.
- **Data Safety (Google)** : *App activity → App interactions* ; *App info and performance → Crash logs, Diagnostics* ; *Device or other IDs*. Chiffré en transit ; **non** vendu à des tiers ; suppression : aucune donnée de compte (rien à supprimer côté utilisateur).
- Aucune donnée de localisation, de contact, de santé, ni de paiement. Le feedback (Web3Forms) envoie uniquement le message et la catégorie saisis par l'utilisateur, vers le courriel du mainteneur.
