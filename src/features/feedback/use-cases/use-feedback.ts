import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { logger } from "@/lib/logger";

import { submitFeedback } from "../domain/feedback.adapter";

export const FEEDBACK_CATEGORIES = ["bug", "idea", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackStatus = "idle" | "sending" | "success" | "error";

// Orchestration du formulaire de feedback (état + validation + envoi).
export const useFeedback = () => {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = message.trim().length > 0;

  const submit = async () => {
    if (message.trim().length === 0) {
      setError(t("feedback.missingFields"));
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      await submitFeedback({ category, message: message.trim() });
      trackEvent("feedback_submitted", { category });
      setStatus("success");
      setCategory(null);
      setMessage("");
    } catch (sendError) {
      logger.error(sendError, { feature: "feedback" });
      setStatus("error");
    }
  };

  return { category, setCategory, message, setMessage, status, error, canSubmit, submit };
};
