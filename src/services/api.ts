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
      console.error(respText);
      return undefined;
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
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    return this.toJSON(await fetch(`${this.apiUrl}/${path}`), schemaValidation);
  }

  protected async post<Ret>(
    path: string,
    body: unknown,
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
      schemaValidation
    );
  }

  protected async put<Ret>(
    path: string,
    body: unknown,
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
      schemaValidation
    );
  }

  protected async patch<Ret>(
    path: string,
    body: unknown,
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
      schemaValidation
    );
  }

  protected async delete<Ret>(
    path: string,
    schemaValidation?: z.ZodSchema<Ret>
  ): Promise<Ret | undefined> {
    return this.toJSON(
      await fetch(`${this.apiUrl}/${path}`, { method: "DELETE" }),
      schemaValidation
    );
  }
}
