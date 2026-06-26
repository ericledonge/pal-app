import { WEB3FORMS } from "@/lib/config";

export interface FeedbackPayload {
  category: string | null;
  message: string;
}

// Envoi sans backend via Web3Forms : POST de la clé publique + champs. Le message arrive
// directement à l'adresse liée à la clé (eric.ledonge@pm.me). Frontière IO, aucun parsing métier.
export const submitFeedback = async ({ category, message }: FeedbackPayload): Promise<void> => {
  if (!WEB3FORMS.accessKey) {
    throw new Error("Clé Web3Forms absente (EXPO_PUBLIC_WEB3FORMS_KEY).");
  }

  const response = await fetch(WEB3FORMS.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS.accessKey,
      subject: category ? `Feedback pal-app — ${category}` : "Feedback pal-app",
      from_name: "Pickleball Action Lévis",
      category: category ?? "non précisée",
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Web3Forms HTTP ${response.status}`);
  }

  const result = (await response.json()) as { success?: boolean };
  if (!result.success) {
    throw new Error("Web3Forms a refusé l'envoi.");
  }
};
