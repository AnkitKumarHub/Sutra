import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { templateService } from "../../services";
import {
  listTemplatesInputModel,
  listTemplatesOutputModel,
} from "./model";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

export const exploreRouter = router({
  listTemplates: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/listTemplates"), tags: TAGS },
    })
    .input(listTemplatesInputModel)
    .output(listTemplatesOutputModel)
    .query(async () => {
      const templates = await templateService.listTemplates();
      return templates.map((t) => ({
        id:          t.id,
        title:       t.title,
        description: t.description ?? null,
        category:    t.category,
        emoji:       t.emoji ?? null,
        isPaid:      t.isPaid,
        usageCount:  t.usageCount ?? 0,
      }));
    }),
});
