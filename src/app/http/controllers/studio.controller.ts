import { type Request, type Response } from "express";
import { prisma } from "../../../infra/db/prisma.js";
import { createStudioSchema, updateStudioSchema } from "../../../schemas/studio.schema.js";

export const studioController = {

  getStudios: async (req: Request, res: Response) => {
    try {
      const studios = await prisma.studio.findMany();
      return res.json({ items: studios });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch studios." });
    }
  },

  getStudio: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const studio = await prisma.studio.findUnique({ where: { id } });
      if (!studio) {
        return res.status(404).json({ message: "Studio not found." });
      }
      return res.json(studio);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch studio." });
    }
  },

  createStudio: async (req: Request, res: Response) => {
    try {
      const parsed = createStudioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error);
      }
      const studio = await prisma.studio.create({ data: parsed.data });
      const studios = await prisma.studio.findMany();
      return res.json({ message: "Studio created.", studio, items: studios });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create studio." });
    }
  },

  updateStudio: async (req: Request, res: Response) => {
    try {
      const parsed = updateStudioSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error);
      }
      const { id } = req.params;

      const studio = await prisma.studio.update({ where: { id }, data: parsed.data });
      const studios = await prisma.studio.findMany();
      return res.json({ message: "Studio updated.", studio, items: studios });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update studio." });
    }
  },

  deleteStudio: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.studio.delete({ where: { id } });
      const studios = await prisma.studio.findMany();
      return res.json({ message: "Studio deleted.", items: studios });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete studio." });
    }
  },

}