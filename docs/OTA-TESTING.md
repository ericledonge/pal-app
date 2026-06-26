# Protocole de test — Auto-update OTA (EAS Update)

Valide le mécanisme de mise à jour à chaud (`expo-updates`) implémenté dans
[`src/lib/updates/`](../src/lib/updates/) : `useAutoUpdate` (orchestration) + `update-gate`
(garde-fou). Voir aussi le [runbook de correctif d'urgence](OTA-RUNBOOK.md).

## Politique appliquée (rappel)

On sépare **télécharger** (toujours sans risque — n'affecte pas le JS en cours) de **appliquer**
(`reloadAsync`, qui redémarre le JS).

| Moment | Comportement |
|---|---|
| Démarrage à froid | Télécharge en silence, **n'applique pas** → s'applique au lancement suivant |
| Retour au premier plan | Vérifie + télécharge, puis **reload silencieux** si l'état est sûr (throttle réseau 5 min) |
| Matrice live (`phase === "live"`) | **Bloqué** : la MAJ reste prête, aucun reload |
| Fin de matrice | Le garde-fou se libère → la MAJ en attente s'applique aussitôt |
| Dev / Expo Go | `Updates.isEnabled === false` → tout est neutralisé |

`app.json` : `updates.checkAutomatically: "NEVER"` (c'est le JS qui pilote les vérifications).

## 1. Tests automatisés (Jest)

Exécutables sans build, en local :

```bash
npm test -- src/lib/updates      # les 2 suites du module
npm test                         # toute la suite
```

Couverture :
- `update-gate.test.ts` — registre de blocage (raisons multiples, idempotence, notifications aux transitions, désabonnement).
- `use-auto-update.test.ts` — séparation télécharger/appliquer, neutralisation en dev, reload au premier plan, **non-reload pendant une matrice live puis reload à sa fin**, throttle réseau, absence de MAJ.

Ces tests verrouillent la logique de décision. Le reste (livraison OTA réelle) se valide sur un **build**.

## 2. Pré-requis pour le test manuel (build réel)

> L'OTA **ne fonctionne ni en Expo Go ni dans le dev client** (`Updates.isEnabled` est `false`).
> Il faut un build installé sur un appareil/simulateur.

1. Configurer EAS Update (une fois) : `npm run update:configure`
2. Construire un build interne : `npm run build:preview` (canal `preview`), puis l'installer.
3. Première publication de référence (v1) : `npm run update:preview -- --message "v1 base"`

### Observer la version OTA chargée

Pour distinguer v1/v2/v3 à l'œil pendant les scénarios, deux options :

- **Simple** : à chaque publication, modifier un libellé visible (ex. un titre d'écran) et confirmer le changement à l'écran.
- **Précis (badge debug temporaire)** : afficher l'identifiant de l'update, p. ex. dans l'écran préférences :

  ```tsx
  import * as Updates from "expo-updates";
  // ...
  <Text variant="caption" className="text-on-surface-muted">
    OTA {Updates.updateId?.slice(0, 8) ?? "embarqué"}
  </Text>
  ```

  À retirer avant la mise en production. Côté serveur, `npm run update:list` liste les updates publiées.

## 3. Scénarios manuels (canal `preview`)

Chaque scénario suppose le build `preview` installé et lancé.

### S1 — MAJ appliquée au lancement suivant
1. App ouverte sur v1.
2. Publier v2 : `npm run update:preview -- --message "v2"`.
3. **Fermer complètement** l'app (kill), puis la rouvrir une 1re fois (télécharge v2 en silence), la refermer, la rouvrir une 2e fois.
4. ✅ Attendu : la 2e réouverture affiche **v2** (le démarrage à froid n'applique pas la MAJ du même lancement, il télécharge ; elle s'applique au lancement d'après).

### S2 — MAJ appliquée au retour au premier plan
1. App ouverte sur v2.
2. Publier v3 : `npm run update:preview -- --message "v3"`.
3. Mettre l'app en arrière-plan (Home), patienter ~3 s, la ramener au premier plan.
4. ✅ Attendu : l'app **recharge silencieusement** et affiche **v3** (le reload ressemble à un chargement normal).

### S3 — Garde-fou : matrice live (le cœur du mécanisme)
1. App ouverte sur v3. Aller dans **Matrice**, ajouter ≥ 4 joueurs, **Générer** (passage en `live`), démarrer le minuteur.
2. Publier v4 : `npm run update:preview -- --message "v4"`.
3. Mettre en arrière-plan ~3 s, revenir au premier plan.
4. ✅ Attendu : **aucun reload**. La matrice et le minuteur sont **intacts** (le décompte continue).
5. Toucher **Terminer** la matrice.
6. ✅ Attendu : l'app **recharge aussitôt** et affiche **v4** (le garde-fou s'est libéré).

### S4 — Throttle réseau
1. App sur la dernière version, aucune nouvelle publication.
2. Enchaîner plusieurs allers-retours arrière-plan/premier plan en moins de 5 min.
3. ✅ Attendu : pas de vérification réseau à chaque fois (une au plus toutes les 5 min). Indolore — surtout valable pour ne pas marteler le réseau ; observable via Sentry/logs si instrumenté.

### S5 — Rollback
1. Sur un build affichant une v(n) problématique.
2. `npm run update:rollback:preview -- --message "rollback vers embarqué"`.
3. Appliquer comme en S1/S2 (réouverture ou retour au premier plan).
4. ✅ Attendu : l'app revient au **bundle embarqué dans le build** (la dernière version saine livrée par le store/build interne).

## 4. Commandes (scripts npm)

| Script | Commande EAS | Usage |
|---|---|---|
| `npm run update:configure` | `eas update:configure` | Lier le projet à EAS Update (une fois) |
| `npm run update:preview` | `eas update --channel preview` | Publier sur le canal preview |
| `npm run update:production` | `eas update --channel production` | Publier sur le canal production |
| `npm run update:list` | `eas update:list` | Lister les updates publiées |
| `npm run update:rollback:preview` | `eas update:roll-back-to-embedded --channel preview` | Revenir au bundle embarqué (preview) |
| `npm run update:rollback:production` | `eas update:roll-back-to-embedded --channel production` | Revenir au bundle embarqué (production) |

Passer un message : `npm run update:preview -- --message "fix parser 2026-06-26"`.
Sans `--message`, EAS le demande en interactif.

> **Compatibilité runtime** : une MAJ OTA n'est livrée qu'aux builds dont le `runtimeVersion`
> correspond (politique `appVersion` → la `version` d'`app.json`). Un changement natif (dépendance
> native, bump SDK, permission) impose un nouveau build store, pas un OTA. Cf. [RELEASE.md](RELEASE.md).
