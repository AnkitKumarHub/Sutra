import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

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

export const useListForms = () => {
  const {
    data: forms,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.listForms.useQuery();

  return {
    forms,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useUpdateForm = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFormAsync,
    mutate: updateForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
      await utils.form.getFormById.invalidate({ formId });
    },
  });

  return {
    updateFormAsync,
    updateForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const usePublishForm = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: publishFormAsync,
    mutate: publishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.publishForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
      await utils.form.getFormById.invalidate({ formId });
    },
  });

  return {
    publishFormAsync,
    publishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUnpublishForm = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: unpublishFormAsync,
    mutate: unpublishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.unpublishForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
      await utils.form.getFormById.invalidate({ formId });
    },
  });

  return {
    unpublishFormAsync,
    unpublishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFormAsync,
    mutate: deleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    deleteFormAsync,
    deleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useCreateField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createField.useMutation({
    onSuccess: async () => {
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return {
    createFieldAsync,
    createField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return {
    updateFieldAsync,
    updateField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useDeleteField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return {
    deleteFieldAsync,
    deleteField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useGetFields = (formId: string) => {
  const {
    data: fields,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getFieldsByFormId.useQuery({ formId }, { enabled: Boolean(formId) }); // Only fetch fields when formId is available

  return {
    fields,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useGetFormById = (formId: string) => {
  const {
    data: form,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getFormById.useQuery({ formId }, { enabled: Boolean(formId) });

  return {
    form,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useGetPublishedFormById = (formId: string) => {
  const {
    data: form,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getPublishedFormById.useQuery({ formId }, { enabled: Boolean(formId) });

  return {
    form,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useSubmitPublicForm = () => {
  const {
    mutateAsync: submitPublicFormAsync,
    mutate: submitPublicForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.submitPublicForm.useMutation();

  return {
    submitPublicFormAsync,
    submitPublicForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useGetFormSubmissions = (formId: string, enabled = true) => {
  const {
    data: submissions,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getFormSubmissions.useQuery(
    { formId },
    { enabled: enabled && Boolean(formId) },
  );

  return {
    submissions,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};
