import { useState } from "react";

import { t } from "@/lib/i18n";

export const FEEDBACK_CATEGORIES = ["bug", "idea", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackStatus = "idle" | "sending" | "success" | "error";

// Orchestration du formulaire de feedback (état + validation). L'envoi réseau réel
// (Web3Forms) est branché à l'issue #22 ; ici, succès local après validation.
export const useFeedback = () => {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = category !== null && message.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) {
      setError(t("feedback.missingFields"));
      return;
    }
    setError(null);
    setStatus("sending");
    setStatus("success");
    setCategory(null);
    setMessage("");
  };

  return { category, setCategory, message, setMessage, status, error, canSubmit, submit };
};
