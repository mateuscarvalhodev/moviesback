import { type Request, type Response } from "express";
import { prisma } from "../../../infra/db/prisma.js";
import { genreCreateSchema, genreUpdateSchema } from "../../../schemas/genre.schema.js";
export const genreController = {

  getGenres: async (req: Request, res: Response) => {
    try {
      const genres = await prisma.genre.findMany();
      return res.status(200).json({ items: genres });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch genres." });
    }
  },

  getGenre: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const genre = await prisma.genre.findUnique({ where: { id: Number(id) } });
      if (!genre) {
        return res.status(404).json({ message: "Genre not found." });
      }
      return res.status(200).json(genre);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch genre." });
    }
  },

  createGenre: async (req: Request, res: Response) => {
    try {
      const parsed = genreCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error);
      }
      const genre = await prisma.genre.create({ data: parsed.data });
      const genres = await prisma.genre.findMany();
      return res.status(201).json({ message: "Genre created.", genre, items: genres });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create genre." });
    }
  },

  updateGenre: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = genreUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error);
      }

      const genre = await prisma.genre.update({ where: { id: Number(id) }, data: parsed.data });

      const genres = await prisma.genre.findMany();
      return res.status(200).json({ message: "Genre updated.", genre, items: genres });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update genre." });
    }
  },

  deleteGenre: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.genre.delete({ where: { id: Number(id) } });
      const genres = await prisma.genre.findMany();
      return res.status(200).json({ message: "Genre deleted.", items: genres });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete genre." });
    }
  },
};