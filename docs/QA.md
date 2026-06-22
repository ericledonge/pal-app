# Checklist de QA manuelle

À exécuter sur **simulateur iOS** et **émulateur Android** (via un dev build : `eas build --profile development` ou `npx expo run:ios` / `run:android`). Consigner chaque anomalie avec la **plateforme** et les **étapes de reproduction**.

> Note : l'app embarque des modules natifs (Sentry, NetInfo, Reanimated, bottom-sheet, async-storage) — elle ne tourne pas dans Expo Go ; un dev client est requis.

## Onboarding & niveau

- [ ] Premier lancement (stockage vidé) → arrive sur l'onboarding (pas de flash de l'app).
- [ ] Grille des 9 niveaux : sélection unique ; « Commencer » désactivé tant qu'aucun niveau.
- [ ] « Commencer » → persiste le niveau et arrive sur Sessions.
- [ ] Relancer l'app → va directement aux onglets (niveau mémorisé).
- [ ] Profil → « Changer de niveau » → sélecteur pré-rempli ; enregistrer met à jour partout ; fermer sans enregistrer ne change rien.

## F1 — Consultation des sessions

- [ ] Bascule Aujourd'hui / Demain charge les deux jours.
- [ ] Bascule « Mon niveau » / « Tous les niveaux » : détail (avec inscrits) vs résumé (sans noms).
- [ ] **Exception 4.0C → 3.5T** : avec le niveau 4.0C, les créneaux 3.5T apparaissent en « Mon niveau » ; avec 3.5T, les 4.0C n'apparaissent **pas**.
- [ ] Taper une carte (mode Mon niveau) → détail avec la liste complète des inscrits.
- [ ] État de **chargement** visible au premier fetch / changement de jour.
- [ ] État **vide** explicite (jour sans créneau / aucun à mon niveau).
- [ ] État d'**erreur** : activer le **mode avion** → message d'erreur réseau + « Réessayer » ; rétablir → la liste se charge.
- [ ] **Pull-to-refresh** rafraîchit ; une erreur pendant le refresh ne vide pas la liste.

## F2 — Matrice de jeu

- [ ] Effectif pré-chargé depuis les présents (si données F1 disponibles).
- [ ] Ajouter un invité (nom) ; ajouter des présents par lot (sélection multiple) ; retirer un joueur (confirmation).
- [ ] Régler le nombre de terrains (min 1) et la durée de match (défaut **13 min**, réglable).
- [ ] « Générer la matrice » désactivé tant que < 4 joueurs.
- [ ] Écran live : appariements « Équipe A contre Équipe B » par terrain, salle d'attente (banc).
- [ ] **Minuteur** : démarrer / pause / réinitialiser ; signal de fin à zéro ; exact après mise en arrière-plan.
- [ ] « Ronde suivante » génère une nouvelle ronde (variété des appariements) ; « précédente » revient.
- [ ] Modifier l'effectif en live (ajout/retrait) → les rondes suivantes s'adaptent.
- [ ] Quitter et relancer en cours de session → reprise sur la ronde courante (état persisté).
- [ ] « Terminer la session » efface l'état (retour à la config).

## Profil & feedback

- [ ] Profil affiche le niveau et la version ; aucune mention de compte/déconnexion.
- [ ] Bascule de préférence (« Démarrer sur Tous les niveaux ») persistée et appliquée à l'agenda.
- [ ] Feedback : catégorie + message ; « Envoyer » désactivé si message vide ; envoi (Web3Forms) → succès ; erreur réseau gérée sans planter.

## Transverse

- [ ] Bascule **thème clair / sombre** (réglage système) sur les deux plateformes — lisibilité OK.
- [ ] **Lisibilité plein soleil** (luminosité max, extérieur si possible).
- [ ] VoiceOver (iOS) / TalkBack (Android) : agenda et écran de match parcourables, libellés lus.
- [ ] Police système agrandie (Dynamic Type) : pas de coupure majeure.
