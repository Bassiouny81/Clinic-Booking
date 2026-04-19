import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req: Request) => {
        return {
          id: (req as any).id,
          method: (req as any).method || req.method,
          url: (req as any).url?.split("?")[0] || req.url?.split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
