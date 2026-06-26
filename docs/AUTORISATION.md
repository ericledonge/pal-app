# Autorisation des données & notes de revue

But : éviter un rejet store et sécuriser le volet vie privée, sur le point qui **n'est couvert
nulle part ailleurs** dans les docs — le fait que l'app **lit et réaffiche le contenu d'un site
tiers** (`pickleballenligne.com`) et des **noms de personnes**.

Les formulaires de confidentialité (App Privacy / Data Safety) et la politique publique sont, eux,
déjà traités dans [`PRIVACY.md`](PRIVACY.md) et [`STORE-LISTING.md`](STORE-LISTING.md).

## Pourquoi c'est le risque n°1

| Règle | Risque | Parade |
|---|---|---|
| **Apple 5.2.2** — interdit de *scraper / réutiliser le contenu et la marque d'un service tiers sans autorisation* | Le reviewer voit que toute la donnée « sessions » vient d'un autre site → **demande une preuve d'autorisation** → rejet si absente | Autorisation écrite du club (+ idéalement du site) + notes de revue ci-dessous |
| **Apple 4.2** — fonctionnalité minimale | Une app « simple fenêtre sur un site web » est jugée trop mince | La matrice de jeu + le filtre niveau = vraie valeur native (déjà argumenté dans `STORE-LISTING.md`) |
| **Loi 25 (Québec)** — communication de renseignements personnels | Réafficher des noms est une nouvelle *communication* de RP | Le club reste **responsable** des données, informe ses membres, offre un retrait (voir modèle A) |

La pièce maîtresse pour 5.2.2 **et** Loi 25, c'est **une autorisation écrite du club**. Un seul
courriel signé règle l'essentiel.

## Modèle A — Autorisation du club (à faire confirmer par écrit)

> **Objet :** Autorisation — application mobile du club Pickleball Action Lévis
>
> Bonjour,
>
> Je développe à titre bénévole une application mobile (« Pickleball Action Lévis »,
> identifiant `ca.palevis.app`) destinée aux membres du club. Elle a deux fonctions :
>
> 1. **Consulter les présences** d'aujourd'hui et de demain, en lisant le **calendrier public**
>    du club hébergé sur `pickleballenligne.com` (l'app ne gère pas les inscriptions, qui restent
>    par courriel) ;
> 2. **Générer des matrices de jeu** sur place (appariements de doubles + minuteur).
>
> Pour la publier sur l'App Store et le Play Store, j'ai besoin d'une confirmation écrite du club
> sur les points suivants :
>
> - le club **autorise** cette application à afficher ses données de sessions et de présences
>   issues de son calendrier public, et la reconnaît comme **application compagnon** du club ;
> - le club **informe ses membres** que leur nom et leur participation, déjà visibles sur le
>   calendrier public, le sont également dans l'application ;
> - le club transmet à l'adresse de contact toute **demande de retrait ou de rectification**
>   formulée par un membre concernant l'affichage de son nom.
>
> Un simple « le club confirme les points ci-dessus » en réponse suffit. Merci !
>
> Éric Le Donge — eric.ledonge@pm.me

À conserver : la réponse signée/datée (capture ou PDF). C'est ce document que tu présentes si Apple
ou Google le demande.

## Modèle B — No-objection du site `pickleballenligne.com` (filet, optionnel)

Le club est le **client** de cette plateforme et est souvent mieux placé pour faire la demande —
proposer au club de la relayer, ou l'envoyer en copie.

> **Objet :** Lecture du calendrier public d'un club via une application compagnon
>
> Bonjour,
>
> Le club Pickleball Action Lévis publie son calendrier de sessions sur votre plateforme. Avec
> l'accord du club, je développe une application mobile bénévole qui **lit ce calendrier public**
> (requêtes en lecture seule, à faible fréquence, déclenchées par l'utilisateur) afin d'en afficher
> les présences aux membres.
>
> L'application n'effectue **aucune inscription ni écriture**, ne contourne aucune authentification
> et ne reproduit pas votre marque. Pourriez-vous me confirmer que cet usage en lecture du
> calendrier public, pour ce club, **ne soulève pas d'objection** de votre part ?
>
> Merci de votre retour,
> Éric Le Donge — eric.ledonge@pm.me

Même si la réponse tarde, **garde une trace de la demande envoyée** : elle démontre la bonne foi et
réduit le risque d'un retrait à la suite d'une plainte de la plateforme.

## Notes de revue — à coller dans les stores

### App Store Connect → « App Review Information » → champ *Notes* (FR + EN)

> **Aucun compte requis** — toutes les fonctionnalités sont accessibles immédiatement, sans
> connexion ni identifiants de démonstration.
>
> Les présences affichées sont lues depuis le **calendrier public en ligne** du club Pickleball
> Action Lévis (`pickleballenligne.com`). L'application est l'**application compagnon officielle du
> club**, qui a **autorisé** cet usage (autorisation écrite disponible sur demande). L'app ne gère
> pas les inscriptions (elles restent par courriel) ; elle sert à **consulter** les présences et à
> animer les matchs sur place. **Aucune donnée personnelle n'est collectée ni stockée** par le
> développeur.
>
> ---
>
> **No account required** — all features are available immediately, with no login or demo
> credentials. Attendance data is read from the **public online calendar** of the Pickleball Action
> Lévis club (`pickleballenligne.com`). This app is the club's **official companion app**, and the
> club has **authorized** this use (written authorization available on request). The app does not
> handle sign-ups (those remain by email); it is read-only for attendance plus an on-site match
> generator. **No personal data is collected or stored** by the developer.

### Google Play Console → « Instructions de test » / « App access »

> Aucune connexion requise : déclarer **« All functionality is available without special access »**.
> Réutiliser le paragraphe ci-dessus (FR/EN) dans les notes destinées aux testeurs.

## Checklist avant soumission

- [ ] Autorisation écrite du club obtenue et archivée (modèle A)
- [ ] Demande envoyée au site `pickleballenligne.com`, trace conservée (modèle B) — *optionnel mais recommandé*
- [ ] Notes de revue collées dans App Store Connect (FR + EN)
- [ ] « App access » de Play : aucune connexion requise
- [ ] Politique de confidentialité en ligne et à jour ([`PRIVACY.md`](PRIVACY.md) / `privacy.html`)
- [ ] Formulaires App Privacy / Data Safety remplis conformément à [`STORE-LISTING.md`](STORE-LISTING.md)
- [ ] Description store mentionne « inscriptions par courriel » (anti-rejet 4.2)
