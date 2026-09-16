/**
 * StartSmart Tech Hub - Resilient API & Response Parser
 * Prevents "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * when endpoints return HTML error pages, Cloud Run cold-starts, or proxy errors.
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
  isHtml?: boolean;
}

/**
 * Safely parse JSON from a fetch Response.
 * Guaranteed never to throw SyntaxError on unexpected non-JSON text.
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
      return {
        ok: response.ok,
        data,
        error: !response.ok ? (data?.error || data?.message || `Request failed with status ${response.status}`) : undefined,
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
      error: err.message || 'Error processing network response.',
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
