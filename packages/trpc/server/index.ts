import { publicProcedure, router } from "./trpc";
import z from "zod";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";

export const serverRouter = router({
  health: healthRouter,
  // auth: authRouter,
  // chaicode: publicProcedure
  //   .meta({
  //     openapi: {
  //       method: "GET",
  //       path: "/chaicode",
  //     },
  //   })
  //   .input(z.object({ name: z.string(), email: z.email() }))
  //   .output(z.object({ message: z.string() }))
  //   .query(async ({ input }) => {
  //     return {
  //       message: `Hello ${input.name} ${input.email}, welcome to Chaicode!`,
  //     };
  //   }),

  auth: authRouter
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
