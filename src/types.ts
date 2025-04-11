import * as z from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  price: z.number().gt(0),
  title: z.string().nullish(),
  description: z.string().nullish(),
  category: z.string(),
  image: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
