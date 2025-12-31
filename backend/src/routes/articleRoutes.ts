import { Router } from "express";
import {
  aiUpdateSchema,
  createArticleSchema,
  idParamSchema,
  updateArticleSchema,
} from "../validators/articleValidator";
import { validateRequest } from "../middleware/validateRequest";
import {
  applyAIUpdate,
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  triggerScrape,
  updateArticle,
} from "../controllers/articleController";

const router = Router();

router.get("/", listArticles);
router.get("/:id", validateRequest(idParamSchema), getArticle);
router.post("/", validateRequest(createArticleSchema), createArticle);
router.put("/:id", validateRequest(updateArticleSchema), updateArticle);
router.delete("/:id", validateRequest(idParamSchema), deleteArticle);
router.post("/:id/ai-update", validateRequest(aiUpdateSchema), applyAIUpdate);
router.post("/scrape/oldest", triggerScrape);

export default router;
