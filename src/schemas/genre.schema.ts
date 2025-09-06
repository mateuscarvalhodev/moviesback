import { z } from "zod";

export const genreCreateSchema = z.object({
  name: z.string().min(1, "Name is mandatory"),
});

export const genreUpdateSchema = z.object({
  name: z.string().min(1, "Name is mandatory").optional(),
});