# Runbook — correctif d'urgence du parser via OTA

Le HTML de `pickleballenligne.com` peut changer et casser le parser (`session.parser.ts`). Sans backend, **EAS Update (OTA)** est le seul levier de réaction rapide : on corrige le JS et on le pousse sans repasser par les stores.

## Symptômes

- L'agenda affiche l'erreur « affichage des présences momentanément indisponible » (`GridParseError`), ou des créneaux manquants/incohérents.
- Remontées Sentry (issue #12) : `GridParseError` ou exceptions dans le parsing.

## Procédure

1. **Reproduire** : capturer le HTML courant des deux plateaux (GET sur les URLs de `session.constants.ts`) et l'enregistrer comme fixture dans `features/sessions/domain/__tests__/fixtures/`.
2. **Diagnostiquer** : lancer `npm test` (le test du parser échoue sur la nouvelle fixture) pour cerner le format qui a changé.
3. **Corriger** `session.parser.ts` (sélecteurs / extraction des codes / noms) en restant tolérant.
4. **Vérifier** : `npm run validate` + `npm test` (verts), idéalement contre la nouvelle fixture réelle.
5. **Publier l'OTA** : `eas update --channel production --message "fix parser <date>"`.
6. **Propagation** : la mise à jour est récupérée au prochain lancement de l'app (selon la politique `expo-updates`). Communiquer aux utilisateurs de rouvrir l'app si urgent.

## Rollback

- `eas update --channel production --message "rollback"` en republiant le commit précédent, ou via le tableau de bord EAS (`eas update:rollback` selon la version de l'outil).

## Cas nécessitant un build store (OTA insuffisant)

- Changement **natif** : nouvelle dépendance native, bump de SDK Expo, modification de `app.json` côté natif (permissions, plugins). Dans ces cas, `runtimeVersion` change → un nouveau build (`eas build --profile production`) puis soumission stores est requis.
