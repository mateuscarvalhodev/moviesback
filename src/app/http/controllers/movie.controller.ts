import { type Request, type Response } from "express";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../../../schemas/movies.schema.js";
import { prisma } from "../../../infra/db/prisma.js";
import type { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { uploadBufferToS3 } from "../../../infra/aws/s3.js";

const toFiniteNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function extFrom(file: Express.Multer.File) {
  const ext = path.extname(file.originalname);
  if (ext) return ext;
  // fallback from mimetype
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[file.mimetype] || "";
}

export const movieController = {
  getMovies: async (req: Request, res: Response) => {
    try {
      const {
        q,
        startYear,
        endYear,
        runtimeMin,
        runtimeMax,
        studioId,
        genreId,
        page,
        pageSize,
      } = req.query;

      const where: Prisma.MovieWhereInput = {};

      if (typeof q === "string" && q.trim()) {
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { originalTitle: { contains: q, mode: "insensitive" } },
          { subtitle: { contains: q, mode: "insensitive" } },
          { overview: { contains: q, mode: "insensitive" } },
        ];
      }

      const sy = toFiniteNumber(startYear);
      const ey = toFiniteNumber(endYear);
      if (sy || ey) {
        const yearFilter: Prisma.IntFilter = {};
        if (sy) yearFilter.gte = sy;
        if (ey) yearFilter.lte = ey;
        where.releaseYear = yearFilter;
      }

      const rmin = toFiniteNumber(runtimeMin);
      const rmax = toFiniteNumber(runtimeMax);
      if (rmin || rmax) {
        const runtimeFilter: Prisma.IntFilter = {};
        if (rmin) runtimeFilter.gte = rmin;
        if (rmax) runtimeFilter.lte = rmax;
        where.runtimeMinutes = runtimeFilter;
      }

      if (typeof studioId === "string" && studioId) {
        where.studioId = studioId;
      }
      const gid = genreId;
      if (gid) {
        where.genres = { some: { id: String(gid) } };
      }
      const take = Math.min(toFiniteNumber(pageSize) ?? 50, 100);
      const currentPage = Math.max(toFiniteNumber(page) ?? 1, 1);
      const skip = (currentPage - 1) * take;
      const [items, total] = await Promise.all([
        prisma.movie.findMany({
          where,
          include: { studio: true, genres: true },
          orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
          skip,
          take,
        }),
        prisma.movie.count({ where }),
      ]);

      return res.status(200).json({
        total,
        page: currentPage,
        pageSize: take,
        items,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch movies." });
    }
  },

  getMovie: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const movie = await prisma.movie.findUnique({
        where: { id },
        include: { studio: true, genres: true },
      });
      if (!movie) {
        return res.status(404).json({ message: "Movie not found." });
      }
      return res.status(200).json(movie);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch movie." });
    }
  },

  createMovie: async (req: Request, res: Response) => {
    try {
      const parsed = createMovieSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid payload.",
          issues: parsed.error,
        });
      }

      const exists = await prisma.movie.findFirst({
        where: {
          title: parsed.data.title,
        },
      });

      if (exists) {
        return res.status(409).json({ message: "Movie already exists." });
      }

      const files = req.files as
        | { [field: string]: Express.Multer.File[] }
        | undefined;

      const slug = slugify(parsed.data.title);
      const now = Date.now().toString(36);
      let posterUrlFinal = "";
      let backdropUrlFinal = "";

      const posterFile = files?.poster?.[0];
      const backdropFile = files?.backdrop?.[0];

      if (posterFile) {
        const key = `/movies/${slug}-${now}-${randomUUID()}/poster${extFrom(posterFile)}`;
        posterUrlFinal = await uploadBufferToS3(
          posterFile.buffer,
          key,
          posterFile.mimetype
        );
      }
      if (backdropFile) {
        const key = `/movies/${slug}-${now}-${randomUUID()}/backdrop${extFrom(backdropFile)}`;
        backdropUrlFinal = await uploadBufferToS3(
          backdropFile.buffer,
          key,
          backdropFile.mimetype
        );
      }

      const { genres, posterUrl, backdropUrl, ...rest } = parsed.data;
      const movie = await prisma.movie.create({
        data: {
          ...rest,
          posterUrl: posterUrlFinal,
          backdropUrl: backdropUrlFinal,
          genres:
            genres && genres.length
              ? { connect: genres.map((id: string) => ({ id })) }
              : undefined,
        },
        include: { studio: true, genres: true },
      });

      return res.status(201).json(movie);
    } catch (err: unknown) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return res.status(409).json({
            message: "Movie already exists for this studio and release year.",
          });
        }
        if (err.code === "P2003") {
          return res.status(400).json({
            message: "Invalid relationship. Check studioId/genreIds.",
          });
        }
      }
      console.error(err);
      return res.status(500).json({ message: "Failed to create movie." });
    }
  },

  deleteMovie: async (req: Request, res: Response) => {
    try {
      const { id, page, pageSize } = req.params;

      const take = Math.min(toFiniteNumber(pageSize) ?? 50, 100);
      const currentPage = Math.max(toFiniteNumber(page) ?? 1, 1);
      const skip = (currentPage - 1) * take;

      const exists = await prisma.movie.findUnique({ where: { id: id } });

      if (!exists) {
        return res.status(404).json({ message: "Movie not found." });
      }

      await prisma.movie.delete({
        where: { id: id },
      });

      const [items, total] = await Promise.all([
        prisma.movie.findMany({
          include: { studio: true, genres: true },
          orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
          skip,
          take,
        }),
        prisma.movie.count(),
      ]);

      return res
        .status(200)
        .json({ message: "Movie deleted.", items, total, page, pageSize });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete movie." });
    }
  },

  updateMovie: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = updateMovieSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error);
      }

      const exists = await prisma.movie.findUnique({ where: { id: id } });

      if (!exists) {
        return res.status(404).json({ message: "Movie not found." });
      }

      const { posterUrl, backdropUrl, genres, ...rest } = parsed.data;

      const posterUrlFinal = posterUrl || exists.posterUrl;
      const backdropUrlFinal = backdropUrl || exists.backdropUrl;

      const movie = await prisma.movie.update({
        where: { id: id },
        data: {
          ...rest,
          posterUrl: posterUrlFinal,
          backdropUrl: backdropUrlFinal,
        },
        include: { studio: true, genres: true },
      });

      return res.status(200).json({ message: "Movie updated.", movie });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update movie." });
    }
  },
};
