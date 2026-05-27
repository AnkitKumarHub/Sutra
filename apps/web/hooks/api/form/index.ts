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

export const useSetFormVisibility = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: setFormVisibilityAsync,
    mutate: setFormVisibility,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.setFormVisibility.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
      await utils.form.getFormById.invalidate({ formId });
    },
  });

  return {
    setFormVisibilityAsync,
    setFormVisibility,
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

export const useUpdateFormLimits = (formId: string) => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateFormLimits.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate({ formId });
      await utils.form.listForms.invalidate();
    },
  });
  return mutation;
};

export const useUpdateFormNotificationSettings = (formId: string) => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateFormNotificationSettings.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate({ formId });
      await utils.form.listForms.invalidate();
    },
  });
  return mutation;
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

export const useGetPublishedFormBySlug = (slug: string, unlockToken?: string) => {
  const {
    data: form,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getPublishedFormBySlug.useQuery(
    { slug, unlockToken },
    { enabled: Boolean(slug) }
  );

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

export const useCloneForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: cloneFormAsync,
    mutate: cloneForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.cloneForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    cloneFormAsync,
    cloneForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useExportCsv = () => {
  const {
    mutateAsync: exportCsvAsync,
    mutate: exportCsv,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.exportCsv.useMutation();

  return {
    exportCsvAsync,
    exportCsv,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

// ── PASSWORD PROTECTION ────────────────────────────────────────────────────

export const useSetFormPassword = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: setFormPasswordAsync,
    mutate: setFormPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.setFormPassword.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate({ formId });
    },
  });

  return {
    setFormPasswordAsync,
    setFormPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useUnlockForm = () => {
  const {
    mutateAsync: unlockFormAsync,
    mutate: unlockForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.form.unlockForm.useMutation();

  return {
    unlockFormAsync,
    unlockForm,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

// ── PAGES ──────────────────────────────────────────────────────────────────

export const useGetPagesByFormId = (formId: string) => {
  const {
    data: pages,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getPagesByFormId.useQuery({ formId }, { enabled: Boolean(formId) });

  return {
    pages,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useGetPublishedPagesBySlug = (slug: string) => {
  const {
    data: pages,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.form.getPublishedPagesBySlug.useQuery({ slug }, { enabled: Boolean(slug) });

  return {
    pages,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useCreatePage = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createPageAsync,
    mutate: createPage,
    error,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createPage.useMutation({
    onSuccess: async () => {
      await utils.form.getPagesByFormId.invalidate({ formId });
    },
  });

  return { createPageAsync, createPage, error, isPending, isSuccess, status };
};

export const useUpdatePage = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updatePageAsync,
    mutate: updatePage,
    error,
    isPending,
    isSuccess,
    status,
  } = trpc.form.updatePage.useMutation({
    onSuccess: async () => {
      await utils.form.getPagesByFormId.invalidate({ formId });
    },
  });

  return { updatePageAsync, updatePage, error, isPending, isSuccess, status };
};

export const useDeletePage = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deletePageAsync,
    mutate: deletePage,
    error,
    isPending,
    isSuccess,
    status,
  } = trpc.form.deletePage.useMutation({
    onSuccess: async () => {
      await utils.form.getPagesByFormId.invalidate({ formId });
      // Also refresh fields since they may have been unassigned
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return { deletePageAsync, deletePage, error, isPending, isSuccess, status };
};

export const useReorderPages = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: reorderPagesAsync,
    mutate: reorderPages,
    error,
    isPending,
    status,
  } = trpc.form.reorderPages.useMutation({
    onSuccess: async () => {
      await utils.form.getPagesByFormId.invalidate({ formId });
    },
  });

  return { reorderPagesAsync, reorderPages, error, isPending, status };
};

export const useReorderFields = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: reorderFieldsAsync,
    mutate: reorderFields,
    error,
    isPending,
    status,
  } = trpc.form.reorderFields.useMutation({
    onSuccess: async () => {
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return { reorderFieldsAsync, reorderFields, error, isPending, status };
};

export const useAssignFieldToPage = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: assignFieldToPageAsync,
    mutate: assignFieldToPage,
    error,
    isPending,
    status,
  } = trpc.form.assignFieldToPage.useMutation({
    onSuccess: async () => {
      await utils.form.getFieldsByFormId.invalidate({ formId });
    },
  });

  return { assignFieldToPageAsync, assignFieldToPage, error, isPending, status };
};

// ── createFromTemplate ────────────────────────────────────────────────────────

export const useCreateFromTemplate = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFromTemplateAsync,
    mutate: createFromTemplate,
    error,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createFromTemplate.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { createFromTemplateAsync, createFromTemplate, error, isPending, isSuccess, status };
};

// ── useListTemplates ──────────────────────────────────────────────────────────

export const useListTemplates = () => {
  const {
    data: templates,
    isLoading,
    error,
  } = trpc.explore.listTemplates.useQuery(undefined);

  return { templates: templates ?? [], isLoading, error };
};

export const useListPublicForms = () => {
  const { data, isLoading, error } = trpc.explore.listPublicForms.useQuery(undefined);
  return { forms: data ?? [], isLoading, error };
};
