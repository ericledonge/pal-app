// Configuration centralisée — clés PUBLIQUES et endpoints uniquement (aucun secret serveur).

export const WEB3FORMS = {
  endpoint: "https://api.web3forms.com/submit",
  // Clé d'accès publique Web3Forms, liée au courriel de réception (eric.ledonge@pm.me).
  // Fournie via EXPO_PUBLIC_WEB3FORMS_KEY (eas.json / .env). À défaut, l'envoi échoue proprement.
  accessKey: process.env.EXPO_PUBLIC_WEB3FORMS_KEY ?? "",
} as const;

// Don volontaire (écran « Faire un don »). Aucune contrepartie : rien n'est débloqué dans l'app.
// Valeurs modifiables par OTA (EAS Update) — pas de rebuild requis.
export const DONATION = {
  // Lien Ko-fi pour les dons par carte / Apple Pay / Google Pay. Tant que vide, le bouton carte
  // est masqué et seul le virement Interac s'affiche.
  kofiUrl: "https://ko-fi.com/ericledonge37131",
  // Réception Interac e-Transfer.
  interacEmail: "eric.ledonge@gmail.com",
  // Réponse à la question de sécurité (pas d'Autodépôt) : le donateur doit l'utiliser à l'envoi.
  // Mettre "" si l'Autodépôt est activé → le bloc « réponse » disparaît de l'écran.
  interacAnswer: "pickleball",
};
