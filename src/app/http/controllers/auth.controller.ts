import { type Request, type Response } from "express";
import z from "zod";
import { prisma } from "../../../infra/db/prisma.js";
import argon2 from "argon2";
import {
  createAccessToken,
  hashRefreshToken,
  newRefreshTokenPlain,
  refreshExpiryDate,
} from "../../auth/token.js";

const registerSchema = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const authController = {
  register: async (req: Request, res: Response) => {
    console.log(req);
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).send(parsed.error);
    }

    const exists = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (exists) {
      return res.status(409).send("User already exists");
    }

    const passwordHash = await argon2.hash(parsed.data.password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
      },
    });

    return res.status(201).send(user);
  },

  login: async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).send(parsed.error);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      parsed.data.password
    );

    if (!isPasswordValid) {
      return res.status(400).send("Invalid password");
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshPlain = newRefreshTokenPlain();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshPlain),
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        expiresAt: refreshExpiryDate(),
      },
    });

    return res.status(200).send({ accessToken, refreshToken: refreshPlain });
  },

  refresh: async (req: Request, res: Response) => {
    const refreshToken = req.headers.authorization?.slice("Bearer ".length);

    if (!refreshToken) {
      return res.status(400).send("Refresh token not found");
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const token = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!token) {
      return res.status(400).send("Invalid refresh token");
    }

    await prisma.refreshToken.update({
      where: {
        id: token.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: token.userId,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshPlain = newRefreshTokenPlain();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshPlain),
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        expiresAt: refreshExpiryDate(),
      },
    });

    return res.status(200).send({ accessToken, refreshToken: refreshPlain });
  },

  logout: async (req: Request, res: Response) => {
    const refreshToken = req.headers.authorization?.slice("Bearer ".length);

    if (!refreshToken) {
      return res.status(400).send("Refresh token not found");
    }

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    res.status(204).send();
  },
};
