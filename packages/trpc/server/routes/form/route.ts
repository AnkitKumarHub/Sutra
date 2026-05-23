import { formService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel } from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;

      const { id } = await formService.createForm({
        title,
        description,
        createdBy: ctx.user.id,
      });

      return { id };
    }),
});
