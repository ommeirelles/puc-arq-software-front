import * as z from "zod";

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
      throw new Error(respText);
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
    options: { schemaValidation?: z.ZodSchema<Ret> } & Parameters<
      typeof fetch
    >[1] = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, { ...options, method: "GET" }),
      options.schemaValidation
    );
  }

  protected async post<Ret>(
    path: string,
    options: { schemaValidation?: z.ZodSchema<Ret> } & Parameters<
      typeof fetch
    >[1] = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        ...options,
        method: "POST",
        body: JSON.stringify(options.body),
      }),
      options.schemaValidation
    );
  }

  protected async put<Ret>(
    path: string,
    options: { schemaValidation?: z.ZodSchema<Ret> } & Parameters<
      typeof fetch
    >[1] = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        ...options,
        method: "PUT",
        body: JSON.stringify(options.body),
      }),
      options.schemaValidation
    );
  }

  protected async patch<Ret>(
    path: string,
    options: { schemaValidation?: z.ZodSchema<Ret> } & Parameters<
      typeof fetch
    >[1] = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(options.body),
      }),
      options.schemaValidation
    );
  }

  protected async delete<Ret>(
    path: string,
    options: { schemaValidation?: z.ZodSchema<Ret> } & Parameters<
      typeof fetch
    >[1] = {}
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, { ...options, method: "DELETE" }),
      options.schemaValidation
    );
  }
}
