/**
 * API client helper with timeout support and exponential backoff retry logic.
 * Designed to handle Circle API rate limits (429) and transient server errors (5xx).
 */

interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
  retries?: number; // Number of retry attempts
  backoffFactor?: number; // Multiplier for backoff delay
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 15000,
    retries = 3,
    backoffFactor = 2,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let delay = 1000; // Starting delay: 1 second

  while (true) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`[API Client] Fetching ${url} (Attempt ${attempt}/${retries + 1})`);
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(id);

      // Return immediately if successful, or if it is a client-side validation error (4xx except 429)
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // Retry on 429 (Rate Limited) or 5xx (Server Errors)
      if (response.status === 429 || response.status >= 500) {
        if (attempt > retries) {
          console.warn(`[API Client] Max retries reached for ${url}. Returning response with status ${response.status}.`);
          return response;
        }

        const waitTime = response.headers.has("Retry-After")
          ? parseInt(response.headers.get("Retry-After") || "1") * 1000
          : delay;

        console.warn(
          `[API Client] Server returned status ${response.status}. Retrying in ${waitTime}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));
        delay *= backoffFactor;
        continue;
      }

      return response;
    } catch (error: any) {
      clearTimeout(id);

      const isTimeout = error.name === "AbortError";
      console.error(
        `[API Client] Request failed for ${url} (Attempt ${attempt}/${retries + 1}). Error: ${
          isTimeout ? "Timeout" : error.message || error
        }`
      );

      if (attempt > retries) {
        throw new Error(
          isTimeout
            ? `Request to ${url} timed out after ${timeout}ms`
            : `Request to ${url} failed: ${error.message || error}`
        );
      }

      console.warn(`[API Client] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }
}
