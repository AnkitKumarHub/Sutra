import { db, eq, desc } from "@repo/database";
import { templatesTable, type SelectTemplate } from "@repo/database/models/template";

class TemplateService {
  public async listTemplates(): Promise<SelectTemplate[]> {
    const templates = await db
      .select()
      .from(templatesTable)
      .orderBy(desc(templatesTable.usageCount));

    return templates;
  }

  public async getTemplateById(id: string): Promise<SelectTemplate | null> {
    const result = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, id));

    return result[0] ?? null;
  }

  public async incrementUsageCount(id: string): Promise<void> {
    const template = await this.getTemplateById(id);
    if (!template) return;

    await db
      .update(templatesTable)
      .set({ usageCount: (template.usageCount ?? 0) + 1 })
      .where(eq(templatesTable.id, id));
  }
}

export default TemplateService;
