// Client HTTP de bas niveau (frontière IO). Aucun parsing, aucune dépendance React/Query.
// Sert le GET « aujourd'hui » et le couple GET-puis-POST « demain » (postback Telerik) :
// d'où la capture et le renvoi explicites des cookies de session, car React Native ne gère
// pas le cookie jar automatiquement de façon fiable.

const DEFAULT_TIMEOUT_MS = 15000;

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-CA,fr;q=0.9",
};

export type HttpErrorKind = "network" | "timeout" | "http";

export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status?: number;

  constructor(kind: HttpErrorKind, message: string, status?: number) {
    super(message);
    this.name = "HttpError";
    this.kind = kind;
    this.status = status;
  }
}

export interface HttpResponse {
  status: number;
  /** Corps brut (HTML rendu serveur). Aucun parsing dans cette couche. */
  body: string;
  /** Valeur d'en-tête `Cookie` à renvoyer dans une requête ultérieure (ex. le POST « demain »). */
  cookies: string;
}

export interface HttpRequestOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  /** En-tête `Cookie` à transmettre (capturé d'une réponse précédente). */
  cookies?: string;
  timeoutMs?: number;
}

/** Extrait `name=value; name2=value2` à partir d'un (ou plusieurs) en-tête(s) Set-Cookie. */
const extractCookies = (headers: Headers): string => {
  const raw = headers.get("set-cookie");
  if (!raw) {
    return "";
  }
  // RN concatène plusieurs Set-Cookie en une chaîne séparée par des virgules. On sépare
  // sur les virgules qui précèdent un nouveau couple `name=` (sans casser les dates Expires).
  return raw
    .split(/,(?=[^;,]+?=)/)
    .map((part) => part.split(";")[0].trim())
    .filter((pair) => pair.includes("="))
    .join("; ");
};

export const httpRequest = async (
  url: string,
  options: HttpRequestOptions = {},
): Promise<HttpResponse> => {
  const { method = "GET", headers, body, cookies, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...DEFAULT_HEADERS,
        ...(cookies ? { Cookie: cookies } : {}),
        ...headers,
      },
      body,
      signal: controller.signal,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new HttpError("http", `Réponse HTTP ${response.status} pour ${url}`, response.status);
    }

    return {
      status: response.status,
      body: responseBody,
      cookies: extractCookies(response.headers),
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError("timeout", `Délai dépassé (${timeoutMs} ms) pour ${url}`);
    }
    throw new HttpError("network", `Échec réseau pour ${url}`);
  } finally {
    clearTimeout(timer);
  }
};

export const httpGet = (url: string, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
  httpRequest(url, { ...options, method: "GET" });

export const httpPostForm = (
  url: string,
  formBody: string,
  options: Omit<HttpRequestOptions, "method" | "body"> = {},
) =>
  httpRequest(url, {
    ...options,
    method: "POST",
    body: formBody,
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...options.headers },
  });
