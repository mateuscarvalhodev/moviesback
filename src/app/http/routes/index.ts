import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { movieController } from "../controllers/movie.controller.js";
import { uploadImages } from "../middlewares/upload.js";
import { studioController } from "../controllers/studio.controller.js";
import { genreController } from "../controllers/genre.controller.js";

export const router = Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/refresh", authController.refresh);
router.delete("/auth/logout", authController.logout);

router.get("/movies", requireAuth, movieController.getMovies);
router.get("/movies/:id", requireAuth, movieController.getMovie);
router.post(
  "/movies/create",
  requireAuth,
  uploadImages,
  movieController.createMovie
);
router.put(
  "/movies/:id",
  requireAuth,
  uploadImages,
  movieController.updateMovie
);
router.delete("/movies/:id", requireAuth, movieController.deleteMovie);

router.get("/studios", requireAuth, studioController.getStudios);
router.get("/studios/:id", requireAuth, studioController.getStudio);
router.post("/studios/create", requireAuth, studioController.createStudio);
router.put("/studios/:id", requireAuth, studioController.updateStudio);
router.delete("/studios/:id", requireAuth, studioController.deleteStudio);

router.get("/genres", requireAuth, genreController.getGenres);
router.get("/genres/:id", requireAuth, genreController.getGenre);
router.post("/genres/create", requireAuth, genreController.createGenre);
router.put("/genres/:id", requireAuth, genreController.updateGenre);
router.delete("/genres/:id", requireAuth, genreController.deleteGenre);
