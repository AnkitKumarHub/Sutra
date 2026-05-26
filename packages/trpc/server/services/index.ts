import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/form-field";
import FormPageService from "@repo/services/form-page";
import FormSubmissionService from "@repo/services/form-submission";
import AnalyticsService from "@repo/services/analytics";
import TemplateService from "@repo/services/template";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formPageService = new FormPageService();
export const formSubmissionService = new FormSubmissionService();
export const analyticsService = new AnalyticsService();
export const templateService = new TemplateService();
