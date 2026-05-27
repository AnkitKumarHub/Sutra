import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, templateService } from "../../services";
import {
  listPublicFormsInputModel,
  listPublicFormsOutputModel,
  listTemplatesInputModel,
  listTemplatesOutputModel,
} from "./model";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

export const exploreRouter = router({
  listPublicForms: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/listPublicForms"), tags: TAGS },
    })
    .input(listPublicFormsInputModel)
    .output(listPublicFormsOutputModel)
    .query(async () => {
      const forms = await formService.listPublicForms();
      return forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description ?? null,
        slug: f.slug ?? "",
        createdAt: f.createdAt ?? null,
      }));
    }),
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
