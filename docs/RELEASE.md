# Versioning, signature & distribution

## Versions

- **Version marketing** (`expo.version` dans `app.json`) : **semver** `MAJEUR.MINEUR.CORRECTIF` (ex. `1.0.0`). Incrémentée manuellement à chaque release notable.
- **Numéros de build** (`ios.buildNumber` / `android.versionCode`) : **auto-incrémentés** par EAS — `eas.json` → profil `production` → `"autoIncrement": true`. Évite les collisions de build sur les stores.
- **runtimeVersion** : politique `appVersion` (`app.json`). Tant que `version` ne change pas, les mises à jour OTA (EAS Update) s'appliquent aux builds existants ; un changement natif (nouvelle dépendance native, bump SDK) impose un nouveau build store.

## Signature & credentials

Gérés par **EAS** (recommandé) :

- **iOS** : certificat de distribution + provisioning profile générés/gérés par EAS (`eas credentials`). Nécessite un compte Apple Developer.
- **Android** : **keystore** géré par EAS. **Sauvegarder le keystore** (`eas credentials` → télécharger) hors-ligne : sa perte empêche toute mise à jour de l'app sur le Play Store.

## Profils de build (eas.json)

| Profil | Usage | Distribution |
|---|---|---|
| `development` | dev client | interne |
| `preview` | build de test interne | interne (canal `preview`) |
| `production` | artefacts stores `.ipa` / `.aab` | stores (canal `production`), `autoIncrement` |

Pré-requis (une fois, compte Expo) : `eas login` → `eas init` (crée le `projectId`).
