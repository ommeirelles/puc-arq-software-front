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


export const CartSchema = z.object({
  id: z.coerce.string(),
  deleted: z.boolean(),
  guid: z.string().uuid(),
});

export type Cart = z.infer<typeof CartSchema>;