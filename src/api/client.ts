const BASE = "/petclinic/api";

export class ApiError extends Error {
  constructor(
    readonly status: number, // 0 = network failure
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      for (const k of ["detail", "message", "title"]) {
        const v = b[k];
        if (typeof v === "string" && v) return v;
      }
    }
  } catch {
    /* body was not JSON */
  }
  return `Request failed (${res.status})`;
}

/** One place for fetch, JSON and error mapping. Callers state the response type at this boundary. */
export async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method: init.method ?? "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "Can’t reach the clinic server. Check that Spring PetClinic REST is running on port 9966.");
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
