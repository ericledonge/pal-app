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

## Soumission aux stores (EAS Submit)

> **Étape de fin, gated par compte** : nécessite les comptes Expo, Apple Developer et Google Play Console + des builds production. Non exécutable sans ces accès — à réaliser par le mainteneur.

Pré-requis : build production réussi (`eas build --profile production -p ios` / `-p android`), QA validée ([`QA.md`](QA.md)), fiche store prête ([`STORE-LISTING.md`](STORE-LISTING.md)).

### Credentials

- **iOS** : clé API App Store Connect (`.p8` + Key ID + Issuer ID) — configurée via `eas credentials` ou saisie à la demande par `eas submit`. `ascAppId` / `appleTeamId` saisis interactivement si absents d'`eas.json`.
- **Android** : compte de service Google (Play Console → Configuration → Accès API) téléchargé en JSON dans `./credentials/google-service-account.json` (**gitignored**). Référencé par `submit.production.android.serviceAccountKeyPath` ou saisi à la demande.

### Commandes

```bash
eas submit --platform ios     --profile production --latest   # → App Store Connect / TestFlight
eas submit --platform android --profile production --latest   # → Play Console, piste interne (track "internal")
```

### Validation avant publication

1. **iOS** : valider le build sur **TestFlight** (testeurs internes) avant promotion en production App Store.
2. **Android** : valider sur la **piste interne** Play Console avant promotion en production.
3. **Checklist de conformité** (avant publication) :
   - [ ] Formulaire de confidentialité rempli (App Privacy / Data Safety) — cf. [`STORE-LISTING.md`](STORE-LISTING.md)
   - [ ] URL de politique de confidentialité publiée et renseignée — [`PRIVACY.md`](PRIVACY.md)
   - [ ] Captures d'écran aux tailles requises (clair + sombre)
   - [ ] Classification de contenu / âge (4+ / Tout public)
   - [ ] Conformité chiffrement iOS : `usesNonExemptEncryption: false` (HTTPS standard) — déjà dans `app.json`
   - [ ] Mention « inscriptions par courriel » présente dans la description (évite un rejet de revue)
