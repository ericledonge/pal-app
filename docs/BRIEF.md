# Application Pickleball Action Lévis

## Contexte

Je veux développer une application mobile (iOS et Android) pour faciliter l'organisation des sessions de pickleball de mon association, **Pickleball Action Lévis**.

L'association regroupe des joueurs répartis par niveau qui se partagent des terrains à Saint-Jean-Chrysostome. L'app doit régler deux besoins : consulter facilement les présences sans passer par le site web actuel, et organiser les parties sur place à l'aide de matrices de jeu.

## Modèle du domaine

**Groupes de niveau** — Les joueurs sont répartis dans neuf groupes : 2.0C, 2.0T, 2.5C, 2.5T, 3.0C, 3.0T, 3.5C, 3.5T et 4.0C. Chaque groupe compte entre ~25 et ~150 joueurs, et un joueur appartient à un seul groupe. Dans les codes, **C** = « Consolidation » et **T** = « Transition » (C est un cran plus faible que T) ; cette distinction n'a pas d'incidence sur l'app — le code de groupe est traité comme une simple étiquette.

**Plateaux et terrains** — Il y a deux plateaux : le **parc** (6 terrains, courts 01 à 06) et la **patinoire** (5 terrains, courts 07 à 11). La numérotation des courts est donc continue sur l'ensemble des deux plateaux. Un calendrier hebdomadaire répartit l'utilisation de ces deux plateaux entre les différents groupes.

**Créneaux horaires** — Un créneau peut être attribué à un seul groupe ou être multi-groupes. Un plateau peut aussi être subdivisé entre plusieurs groupes (par exemple, sur le parc, un groupe obtient 3 terrains et un autre groupe les 3 autres).

## Situation actuelle

Aujourd'hui, les présences sont gérées par des courriels et un site web :

- Chaque jour à 15 h, les joueurs reçoivent un courriel pour s'inscrire pour le lendemain. Ce courriel contient deux liens : un pour **s'inscrire** à un créneau, un pour **se désinscrire**.
- Selon le nombre de créneaux qui concernent son groupe ce jour-là (dont les créneaux multi-groupes), un joueur peut recevoir plusieurs courriels par jour, chacun avec un lien différent.
- En cliquant sur un lien, le joueur est redirigé vers le site web. Ce site agit comme un agenda : il affiche, par créneau, quel groupe occupe quel plateau et quels terrains, le nombre d'inscrits et la liste des participants.

**Ce que l'app change** — L'inscription et la désinscription continuent de passer par les liens des courriels ; l'app ne gère pas les présences. L'app remplace uniquement le **site web**, pour la consultation des présences.

> **URLs de consultation** (même `gi` = club Pickleball Action Lévis, un `li` par plateau, suffixe `contentOnly` pour le fragment HTML sans habillage) :
>
> - **Parc** : `https://pickleballenligne.com/PublicFront/Locations/LocationBooking.aspx?gi=57b1795f-27c9-4fba-a146-aaede7bc32e4&li=5ae8a235-b6cf-4e47-94fc-0a15fd831136&contentOnly`
> - **Patinoire** : `https://pickleballenligne.com/PublicFront/Locations/LocationBooking.aspx?gi=57b1795f-27c9-4fba-a146-aaede7bc32e4&li=3fc4bef4-a5e7-4895-9767-1e1e22428459&contentOnly`

## Fonctionnalité 1 — Consultation des sessions

L'app présente les sessions d'**aujourd'hui** et de **demain** dans une **vue agenda** par journée. Pas de compte ni d'inscription dans l'app : la consultation est ouverte (l'URL est publique). L'utilisateur indique seulement **son niveau** via un réglage local, qui sert à filtrer.

**Deux modes (bascule de filtre) :**

- **Mon niveau** — n'affiche que les créneaux pertinents pour mon niveau, avec le détail : heure, plateau, terrain(s), nombre d'inscrits et **liste des inscrits**.
- **Tous les niveaux** — affiche tous les créneaux de la journée en **résumé** : heure, plateau, libellé/niveau du créneau et nombre d'inscrits (la liste des noms n'est pas nécessaire dans cette vue d'ensemble).

**Ce qui compte comme « mon niveau » :**

- Les créneaux portant exactement mon niveau (p. ex. `4.0C`).
- Les créneaux multi-groupes qui incluent mon niveau (p. ex. `3.5C & 3.5T` est pertinent pour un joueur 3.5C comme pour un 3.5T).
- **Exception de compatibilité (à sens unique)** : le **4.0C** peut jouer avec le **3.5T** — un joueur 4.0C voit donc aussi les créneaux 3.5T, mais pas l'inverse (un joueur 3.5T ne voit pas les créneaux 4.0C). C'est la seule exception.

**Source des données** — Les informations proviennent de la page de réservation du site actuel (URLs plus haut), qui est du HTML rendu côté serveur (ASP.NET) : pas de JavaScript à exécuter ni de navigateur headless requis. La grille d'aujourd'hui et de demain est **publique** (confirmé en navigation déconnectée) ; la connexion ne sert qu'à *réserver*, ce que l'app ne fait pas.

**Récupération — en in-app (pas de backend).** La grille est récupérée directement par l'app, sans serveur intermédiaire. *Aujourd'hui* : simple GET sur l'URL du plateau. *Demain* : postback ASP.NET — un GET pour récolter les jetons et les cookies de session, puis un POST (voir la recette plus bas) ; le ViewState chiffré et la gestion des cookies se font donc sur l'appareil. **TanStack Query** assure le cache court et le rafraîchissement pour offrir des données fraîches, car les présences bougent toute la journée jusqu'à la dernière minute. En cas de changement du HTML du site qui casserait le parsing, un correctif peut être poussé rapidement via **EAS Update** (OTA), sans repasser par les stores.

**Structure observée sur la page** (à parser) — La grille présente les courts en colonnes et des plages de 2 h en lignes. Pour une plage de groupe, un court porte la liste : un compteur « X libres » suivi des noms des inscrits, tandis que les autres courts sont marqués « Bloquée » avec le code du groupe. Points d'attention relevés sur les deux plateaux :

- **Codes de groupe** à formats variables : code simple (`3.0C`, `3.5C`) ou multi-groupes, noté tantôt `2.5C & 2.5T`, tantôt `2.0C&T`. Prévoir les deux écritures.
- **Libellés spéciaux** en plus des codes : « Open Play » / « Groupe ouvert », « Jeu libre public ».
- **Capacité différente selon le plateau** : max 36 au parc, max 30 à la patinoire. Pour compter les inscrits, **compter les noms listés** est plus fiable que `max − libres` (certaines plages ont une limite spécifique, signalée par « Limite »).
- **Types de plage** : « Bloquée » (groupe), « Réservée » (réservation individuelle d'une heure, avec noms), « Libre » (créneau individuel disponible), « n/d », en plus des plages de groupe avec liste.

> **Recette pour récupérer « demain »** (côté app) : la navigation par date est un postback Telerik RadScheduler. Faire un GET sur l'URL du plateau (récolte les `<input type="hidden">` du formulaire + les cookies de session), puis re-POSTer sur la même URL en renvoyant **tous** ces champs cachés tels quels, en n'écrasant que `__EVENTTARGET` (le contrôle `BookingScheduler`) et `__EVENTARGUMENT={"Command":"NavigateToNextPeriod"}` pour viser le lendemain. Le ViewState étant chiffré (`__VIEWSTATEENCRYPTED`), il ne peut pas être fabriqué : la récupération est forcément en deux temps (GET puis POST). En React Native, prévoir la transmission explicite des cookies de session entre le GET et le POST. Le contrôle public ne donne accès qu'à aujourd'hui et demain (plage revalidée côté serveur), ce qui correspond pile au besoin.

## Fonctionnalité 2 — Générateur de matrices de jeu

Sur place, on organise souvent les parties avec des **matrices de jeu**, parce que le nombre de joueurs présents ne correspond pas toujours au nombre de terrains. Le principe de base est connu (beaucoup d'apps le font) :

- On entre la liste des joueurs et le nombre de terrains disponibles.
- L'app génère une série de parties en double, avec des appariements qui font tourner partenaires et adversaires d'une partie à l'autre (par exemple, partie 1 : A+B contre C+D ; partie 2 : A+D contre B+C ; etc.).
- Quand il y a plus de joueurs que de places, la rotation doit répartir équitablement les **benchs** — les joueurs qui restent sur le banc pour une partie.

**Plus-value de notre app** — Au début de la session, la liste des joueurs est **préchargée** à partir des personnes indiquées présentes (données de la fonctionnalité 1). On peut ensuite ajuster cette liste à la volée : ajouter des joueurs choisis parmi les membres du groupe, ou ajouter des **joueurs libres** (non rattachés à un groupe).

**Minuteur de match** — Un compte à rebours par match, **13 min par défaut** (le tempo des sessions) mais **réglable**, pour rythmer les rotations : la fin du minuteur signale le passage à la partie suivante.

**Gestion dynamique en cours de session** *(nice to have)* — Pouvoir modifier la liste pendant que la session est en cours et régénérer automatiquement les parties suivantes :

- **Retirer** un joueur (par exemple en cas de blessure) et recalculer les appariements des parties restantes.
- **Ajouter** un ou deux joueurs en cours de route.
- Dans les deux cas, continuer de maximiser la variété des appariements en tenant compte des parties déjà jouées, pour éviter de refaire jouer les mêmes personnes ensemble.

## Architecture technique

- **Plateformes** : application mobile pour iOS et Android, sans version web.
- **Framework** : React Native avec Expo, build et déploiement via EAS, mises à jour OTA via EAS Update.
- **Langage** : TypeScript.
- **Navigation** : Expo Router.
- **État** : minimal. La **préférence de niveau** est persistée localement (AsyncStorage ou MMKV) ; le reste (filtre, jour affiché, état de la session de matrice) se gère avec les primitives React (`useState` / `useReducer`). Un store dédié (Zustand) n'est à introduire **que si c'est justifié** — p. ex. si l'état de session de la matrice gagne à être partagé entre écrans ou persisté pour reprise.
- **Données distantes / cache** : TanStack Query (ex-React Query) pour la récupération directe des présences depuis le site, la mise en cache courte et le rafraîchissement automatique.
- **Composants UI** : Expo UI (`@expo/ui`), stable depuis le SDK 56.

> *Note sur Expo UI :* c'est une librairie de **primitives natives**, pas un système de design clé en main. Elle expose directement les composants SwiftUI (iOS) et Jetpack Compose (Android) plutôt que de simuler l'UI en JavaScript — idéal pour tout ce qui doit avoir l'allure du système (réglages, listes, sélecteurs, modales, sheets). Pour les écrans plus personnalisés (image de marque, mises en page sur mesure), la compléter avec les primitives React Native (`View`, `Text`) et une solution de style comme NativeWind.
