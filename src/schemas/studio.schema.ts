import z from "zod";

export const createStudioSchema = z.object({ name: z.string().min(1, "Name is mandatory") });

export const updateStudioSchema = z.object({ name: z.string().min(1, "Name is mandatory").optional() });