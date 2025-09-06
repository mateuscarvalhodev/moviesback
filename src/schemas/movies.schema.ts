import { z } from "zod";
import { ContentRating, ReleaseStatus } from "@prisma/client";

const urlOpt = z.string().optional();
const decimalOpt = z.union([z.number(), z.string()]).optional();

export const createMovieSchema = z
  .object({
    title: z.string().min(1, "Title is mandatory"),
    originalTitle: z.string().optional(),
    subtitle: z.string().optional(),
    overview: z.string().optional(),

    runtimeMinutes: z.coerce.number().int().min(1).max(32767),
    releaseYear: z.coerce.number().int().min(1888).max(3000),
    releaseDate: z.coerce.date().optional(),

    contentRating: z.enum(ContentRating),
    status: z.enum(ReleaseStatus).default("RELEASED"),

    popularity: decimalOpt,
    approbation: z.coerce
      .number()
      .min(0, "min accepted value is 0")
      .max(100, "max accepted value is 100")
      .optional(),
    voteCount: z.coerce.number().int().min(0).optional(),
    budget: decimalOpt,
    revenue: decimalOpt,
    profit: decimalOpt,

    originalLanguage: z.string().max(5).optional(),
    originCountry: z.string().max(2).optional(),

    posterUrl: urlOpt,
    backdropUrl: urlOpt,
    trailerUrl: urlOpt,

    studioId: z.uuid(),
    studioName: z.string().optional(),
    genres: z.array(z.string()).optional(),
    genreNames: z.array(z.string().min(1)).optional(),
  })
  .refine((d) => !!(d.studioId || d.studioName), {
    message: "Informe studioId ou studioName",
    path: ["studioId"],
  });

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
