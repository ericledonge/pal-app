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
    close: "Fermer",
  },
  tabs: {
    sessions: "Sessions",
    matrix: "Matrice",
    profile: "Profil",
  },
  onboarding: {
    title: "Bienvenue",
    intro: "Choisis ton niveau pour personnaliser ton agenda des sessions.",
    ctTitle: "À propos des codes",
    ctExplainer:
      "C = Consolidation, T = Transition. Le code identifie simplement ton groupe ; cette distinction n'a pas d'incidence dans l'app.",
    selectInstruction: "Sélectionne ton niveau",
    start: "Commencer",
  },
  sessions: {
    title: "Sessions",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    myLevel: "Mon niveau",
    allLevels: "Tous les niveaux",
    empty: "Aucun créneau pour ce jour.",
    emptyMyLevel: "Aucun créneau à ton niveau pour ce jour.",
    errorNetwork: "Connexion impossible. Vérifie ta connexion et réessaie.",
    errorParsing: "Affichage des présences momentanément indisponible.",
    registrants: "Inscrits",
    noRegistrants: "Aucun inscrit pour l'instant.",
  },
  matrix: {
    title: "Matrice",
    subtitle: "Générateur de matrices de jeu — à venir.",
  },
  profile: {
    title: "Profil",
    myLevel: "Mon niveau",
    changeLevel: "Changer de niveau",
    noLevel: "Non défini",
    preferences: "Préférences",
    help: "Aide et commentaires",
    feedback: "Donner mon avis",
    version: "Version",
  },
  preferences: {
    defaultAllLevels: "Démarrer sur « Tous les niveaux »",
    themeNote: "Le thème (clair/sombre) suit le réglage de ton appareil.",
  },
  feedback: {
    title: "Donner mon avis",
    intro: "Une suggestion ou un souci avec l'app ? Dis-le-moi.",
    category: "Catégorie",
    categoryBug: "Problème",
    categoryIdea: "Idée",
    categoryOther: "Autre",
    message: "Message",
    messagePlaceholder: "Décris ta suggestion ou le problème…",
    send: "Envoyer",
    success: "Merci ! Ton message a été envoyé.",
    error: "Échec de l'envoi. Réessaie plus tard.",
    missingFields: "Choisis une catégorie et écris un message.",
  },
} as const;
