import * as z from "zod";

export const ProductRatingSchema = z.object({
  rate: z.number(),
  count: z.number(),
});

export const ProductSchema = z.object({
  id: z.number(),
  price: z.number().gt(0),
  title: z.string().nullish(),
  description: z.string().nullish(),
  category: z.string(),
  image: z.string(),
  rating: ProductRatingSchema.nullish(),
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

export const CartSummaryEntrySchema = z.object({
  product_id: z.number(),
  quantity: z.number(),
});

export type CartSummaryEntry = z.infer<typeof CartSummaryEntrySchema>;

export const CartSummarySchema = z.object({
  guid: z.string().uuid(),
  id: z.number(),
  items: z.array(CartSummaryEntrySchema),
  total: z.number(),
});

export type CartSummary = z.infer<typeof CartSummarySchema>;

export const AuthTokenSchema = z.object({
  token: z.string(),
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const RegisterFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z.string().min(1, "Password is required."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export const LoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;

export const AddToCartFormSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
});

export type AddToCartForm = z.infer<typeof AddToCartFormSchema>;

export const ApiErrorSchema = z.object({
  message: z.string(),
});

export const ValidationErrorsSchema = z.array(
  z.object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
  })
);
