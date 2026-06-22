// Configuration centralisée — clés PUBLIQUES et endpoints uniquement (aucun secret serveur).

export const WEB3FORMS = {
  endpoint: "https://api.web3forms.com/submit",
  // Clé d'accès publique Web3Forms, liée au courriel de réception (eric.ledonge@pm.me).
  // Fournie via EXPO_PUBLIC_WEB3FORMS_KEY (eas.json / .env). À défaut, l'envoi échoue proprement.
  accessKey: process.env.EXPO_PUBLIC_WEB3FORMS_KEY ?? "",
} as const;
