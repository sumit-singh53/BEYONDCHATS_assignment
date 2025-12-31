import { type ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const validateRequest = (schema: ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      next(new HttpError(400, "Validation failed", error));
    }
  };
