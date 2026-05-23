import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation();  //utils.form.something.invalidate() when there is a cached query that should refresh after mutation.trpc.form.getForms.useQuery(), trpc.form.listForms.useQuery(), trpc.form.getFormById.useQuery()

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
