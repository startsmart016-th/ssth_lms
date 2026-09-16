/**
 * StartSmart Tech Hub - Resilient API & Response Parser
 * Prevents "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * and React Error #31 (objects with keys {code, message} rendered as children).
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
  isHtml?: boolean;
}

/**
 * Robustly converts any error representation (string, Error instance, object with {code, message}, etc.)
 * into a safe, human-readable display string. Never returns an object.
 */
export function extractErrorMessage(input: any, fallback = 'An unexpected error occurred.'): string {
  if (!input) return fallback;
  if (typeof input === 'string') return input.trim() || fallback;
  if (typeof input === 'number' || typeof input === 'boolean') return String(input);
  if (input instanceof Error) return input.message || fallback;

  if (typeof input === 'object') {
    // Check if error has code and message (e.g. Vercel, Firebase, MongoDB, API gateway errors)
    if (typeof input.message === 'string' && input.message.trim()) {
      return input.code ? `${input.message} (Code: ${input.code})` : input.message;
    }
    // Check if error property exists
    if (typeof input.error === 'string' && input.error.trim()) {
      return input.error;
    }
    if (typeof input.error === 'object' && input.error !== null) {
      return extractErrorMessage(input.error, fallback);
    }
    if (typeof input.detail === 'string' && input.detail.trim()) {
      return input.detail;
    }
    if (typeof input.msg === 'string' && input.msg.trim()) {
      return input.msg;
    }
    if (input.code !== undefined && input.code !== null) {
      return `Error (Code: ${input.code})`;
    }
    try {
      const jsonStr = JSON.stringify(input);
      if (jsonStr !== '{}') return jsonStr;
    } catch {
      // ignore
    }
  }

  return fallback;
}

/**
 * Safely parse JSON from a fetch Response.
 * Guaranteed never to throw SyntaxError on unexpected non-JSON text
 * and guaranteed that `error` is always a clean string (never an object).
 */
export async function safeParseResponse<T = any>(
  response: Response,
  fallbackData?: T
): Promise<{ ok: boolean; data: T; error?: string }> {
  try {
    const text = await response.text();
    const trimmed = (text || '').trim();

    // Check if response is empty
    if (!trimmed) {
      return {
        ok: response.ok,
        data: (fallbackData ?? (Array.isArray(fallbackData) ? [] : {})) as T,
        error: response.ok ? undefined : `Server returned empty response (${response.status})`,
      };
    }

    // Detect HTML responses or cloud proxy error pages (e.g. "The page cannot be found")
    if (
      trimmed.startsWith('<') ||
      trimmed.toLowerCase().startsWith('<!doctype') ||
      trimmed.toLowerCase().startsWith('the page') ||
      trimmed.toLowerCase().includes('<html')
    ) {
      return {
        ok: false,
        data: (fallbackData ?? (Array.isArray(fallbackData) ? [] : {})) as T,
        error: response.ok
          ? 'Invalid server response (HTML received instead of JSON).'
          : `Service temporarily unavailable (${response.status}). Please try again.`,
      };
    }

    // Attempt JSON parse
    try {
      const data = JSON.parse(trimmed);
      let parsedError: string | undefined = undefined;
      if (!response.ok) {
        if (data?.error !== undefined && data?.error !== null) {
          parsedError = extractErrorMessage(data.error);
        } else if (data?.message !== undefined && data?.message !== null) {
          parsedError = extractErrorMessage(data);
        } else if (data?.code !== undefined && data?.code !== null) {
          parsedError = extractErrorMessage(data);
        } else {
          parsedError = `Request failed with status ${response.status}`;
        }
      }
      return {
        ok: response.ok,
        data,
        error: parsedError,
      };
    } catch {
      return {
        ok: false,
        data: (fallbackData ?? (Array.isArray(fallbackData) ? [] : {})) as T,
        error: `Server returned non-JSON data (${response.status}). Please try again.`,
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      data: (fallbackData ?? (Array.isArray(fallbackData) ? [] : {})) as T,
      error: extractErrorMessage(err, 'Error processing network response.'),
    };
  }
}

/**
 * Safe fetch wrapper that handles network errors, timeouts, and non-JSON responses cleanly.
 */
export async function safeApiFetch<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackData?: T
): Promise<SafeApiResponse<T>> {
  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    });

    const parsed = await safeParseResponse<T>(response, fallbackData);

    return {
      ok: response.ok && parsed.ok,
      status: response.status,
      data: parsed.data,
      error: parsed.error,
    };
  } catch (error: any) {
    console.warn(`[safeApiFetch] Network error calling ${input.toString()}:`, error);
    return {
      ok: false,
      status: 0,
      data: (fallbackData ?? (Array.isArray(fallbackData) ? [] : {})) as T,
      error: error.message || 'Network connection unavailable. Please check your connection.',
    };
  }
}

export default extractErrorMessage;
