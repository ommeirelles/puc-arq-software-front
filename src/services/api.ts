import * as z from "zod";

type RequestOptions<Ret> = { schemaValidation?: z.ZodSchema<Ret> } & Omit<
  RequestInit,
  "body"
> & { body?: unknown };

function toRequestInit<Ret>(
  options: RequestOptions<Ret>,
  method: string,
  withBody = false
): RequestInit {
  const init: Record<string, unknown> = { ...options, method };
  delete init.schemaValidation;

  if (withBody) {
    init.body = JSON.stringify(options.body);
  } else {
    delete init.body;
  }

  return init as RequestInit;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export abstract class Api {
  protected abstract apiUrl: string;

  protected async toJSON<Ret>(
    response: Awaited<ReturnType<typeof fetch>>,
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    if (!response.ok) {
      const respText = await response
        .text()
        .catch(() => "Error when trying to parse response to text");
      throw new ApiError(response.status, respText);
    }

    const resp = await response.json();

    if (schemaValidation) {
      const parsed = schemaValidation.safeParse(resp);
      if (!parsed.success) {
        console.error(
          "Error when trying to parse response to schema",
          parsed.error
        );
        return undefined;
      }
    }

    return resp as Ret;
  }

  protected async get<Ret>(
    path: string,
    options: RequestOptions<Ret> = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, toRequestInit(options, "GET")),
      options.schemaValidation
    );
  }

  protected async post<Ret>(
    path: string,
    options: RequestOptions<Ret> = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(
        `${this.apiUrl}/${path}`,
        toRequestInit(options, "POST", true)
      ),
      options.schemaValidation
    );
  }

  protected async put<Ret>(
    path: string,
    options: RequestOptions<Ret> = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(
        `${this.apiUrl}/${path}`,
        toRequestInit(options, "PUT", true)
      ),
      options.schemaValidation
    );
  }

  protected async patch<Ret>(
    path: string,
    options: RequestOptions<Ret> = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(
        `${this.apiUrl}/${path}`,
        toRequestInit(options, "PATCH", true)
      ),
      options.schemaValidation
    );
  }

  protected async delete<Ret>(
    path: string,
    options: RequestOptions<Ret> = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, toRequestInit(options, "DELETE")),
      options.schemaValidation
    );
  }
}
