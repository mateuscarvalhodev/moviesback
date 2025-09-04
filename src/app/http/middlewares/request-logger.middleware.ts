import { type Request, type Response } from "express";
import { verifyAccessToken } from "../../auth/token.js";

export async function requireAuth(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.sendStatus(401).json({ error: "Unauthorized" });
  }

  const token = auth.slice("Bearer ".length);
  try {
    const payload = await verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
