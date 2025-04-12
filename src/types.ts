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

export const CartEntrySchema = z.object({
  cart_guid: z.string().uuid(),
  deleted: z.boolean(),
  id: z.number(),
  product_id: z.number(),
});

export type CartEntry = z.infer<typeof CartEntrySchema>;

export const AddItemToCartReturnSchema = z.object({
  data: z.array(
    z.object({
      cart_guid: z.string().uuid(),
      deleted: z.boolean(),
      id: z.number(),
      product_id: z.number(),
    })
  ),
});

export type AddItemToCartReturn = z.infer<typeof AddItemToCartReturnSchema>;

export const CartSummarySchema = z.object({
  guid: z.string().uuid(),
  id: z.number(),
  items: z.array(CartEntrySchema),
  total: z.number(),
});

export type CartSummary = z.infer<typeof CartSummarySchema>;
