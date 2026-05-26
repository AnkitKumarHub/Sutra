import { publicProcedure, router } from "./trpc";
import z from "zod";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { analyticsRouter } from "./routes/analytics/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  form: formRouter,
  analytics: analyticsRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
