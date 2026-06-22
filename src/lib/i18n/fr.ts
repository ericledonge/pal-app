// Catalogue de traductions — français (langue par défaut et unique de l'app).
//
// Convention de clés : un objet de premier niveau par domaine/feature
// (`common`, `tabs`, `onboarding`, `sessions`, `matrix`, `profile`) pour éviter
// les collisions entre epics. Ajouter les nouvelles chaînes sous le bon namespace.
export const fr = {
  common: {
    soon: "à venir",
    retry: "Réessayer",
    cancel: "Annuler",
    save: "Enregistrer",
  },
  tabs: {
    sessions: "Sessions",
    matrix: "Matrice",
    profile: "Profil",
  },
  onboarding: {
    title: "Bienvenue",
    subtitle: "Onboarding (sélection du niveau) à venir.",
  },
  sessions: {
    title: "Sessions",
    subtitle: "Consultation des présences — à venir.",
  },
  matrix: {
    title: "Matrice",
    subtitle: "Générateur de matrices de jeu — à venir.",
  },
  profile: {
    title: "Profil",
    subtitle: "Profil, niveau et réglages — à venir.",
  },
} as const;
