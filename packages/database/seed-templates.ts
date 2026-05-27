/**
 * Standalone seed script for templates.
 * Run with: pnpm --filter @repo/database db:seed-templates
 *
 * This script is idempotent — safe to run multiple times.
 * It checks for existing templates by title and skips duplicates.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { env } from "./env";
import { templatesTable } from "./models/template";
import type { TemplateField } from "./models/template";

const db = drizzle(env.DATABASE_URL);

const TEMPLATES: Array<{
  title: string;
  description: string;
  category: "feedback" | "hr" | "education" | "events" | "research" | "health" | "business" | "personal";
  emoji: string;
  isPaid: boolean;
  fields: TemplateField[];
}> = [
  // 1. Customer Satisfaction Survey
  {
    title: "Customer Satisfaction Survey",
    description: "Measure how happy your customers are and gather actionable feedback.",
    category: "feedback",
    emoji: "⭐",
    isPaid: false,
    fields: [
      { label: "Your Name",          labelKey: "your-name",          type: "SHORT_TEXT", isRequired: true,  placeholder: "John Doe" },
      { label: "Email Address",      labelKey: "email-address",      type: "EMAIL",      isRequired: true,  placeholder: "john@example.com" },
      { label: "Overall Rating",     labelKey: "overall-rating",     type: "RATING",     isRequired: true },
      { label: "What did you like?", labelKey: "what-did-you-like",  type: "LONG_TEXT",  isRequired: false, placeholder: "Tell us what worked well..." },
      { label: "Suggestions",        labelKey: "suggestions",        type: "LONG_TEXT",  isRequired: false, placeholder: "How can we improve?" },
    ],
  },
  // 2. Job Application Form
  {
    title: "Job Application Form",
    description: "Collect applications for open positions with all the key details.",
    category: "hr",
    emoji: "💼",
    isPaid: false,
    fields: [
      { label: "Full Name",            labelKey: "full-name",            type: "SHORT_TEXT", isRequired: true,  placeholder: "Your full name" },
      { label: "Email Address",        labelKey: "email-address",        type: "EMAIL",      isRequired: true,  placeholder: "you@example.com" },
      { label: "Role Applying For",    labelKey: "role-applying-for",    type: "SHORT_TEXT", isRequired: true,  placeholder: "e.g. Senior Engineer" },
      { label: "Years of Experience",  labelKey: "years-of-experience",  type: "NUMBER",     isRequired: true },
      { label: "LinkedIn / Portfolio", labelKey: "linkedin-portfolio",   type: "SHORT_TEXT", isRequired: false, placeholder: "https://linkedin.com/in/..." },
      { label: "Cover Letter",         labelKey: "cover-letter",         type: "LONG_TEXT",  isRequired: false, placeholder: "Tell us about yourself..." },
    ],
  },
  // 3. Event Registration
  {
    title: "Event Registration",
    description: "Streamline event sign-ups with attendee details and preferences.",
    category: "events",
    emoji: "🎫",
    isPaid: false,
    fields: [
      { label: "Full Name",            labelKey: "full-name",            type: "SHORT_TEXT",    isRequired: true },
      { label: "Email Address",        labelKey: "email-address",        type: "EMAIL",         isRequired: true },
      { label: "Phone Number",         labelKey: "phone-number",         type: "SHORT_TEXT",    isRequired: false, placeholder: "+91 98765 43210" },
      { label: "Session Preference",   labelKey: "session-preference",   type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Morning", "Afternoon", "Evening"] } },
      { label: "Dietary Requirements", labelKey: "dietary-requirements", type: "SINGLE_SELECT", isRequired: false, config: { options: ["None", "Vegetarian", "Vegan", "Gluten-Free"] } },
      { label: "T-Shirt Size",         labelKey: "t-shirt-size",         type: "SINGLE_SELECT", isRequired: false, config: { options: ["XS", "S", "M", "L", "XL", "XXL"] } },
    ],
  },
  // 4. Employee Feedback
  {
    title: "Employee Feedback",
    description: "Anonymous feedback on management, collaboration, and workplace culture.",
    category: "hr",
    emoji: "📊",
    isPaid: false,
    fields: [
      { label: "Department",              labelKey: "department",              type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Engineering", "Design", "Marketing", "Sales", "HR", "Operations", "Finance", "Other"] } },
      { label: "Rate Your Manager",       labelKey: "rate-your-manager",       type: "RATING",        isRequired: true },
      { label: "Rate Team Collaboration", labelKey: "rate-team-collaboration", type: "RATING",        isRequired: true },
      { label: "What's going well?",      labelKey: "whats-going-well",        type: "LONG_TEXT",     isRequired: false, placeholder: "Share what the team is doing great..." },
      { label: "What needs improvement?", labelKey: "what-needs-improvement",  type: "LONG_TEXT",     isRequired: false, placeholder: "Be honest — this is anonymous." },
    ],
  },
  // 5. Course Feedback
  {
    title: "Course Feedback",
    description: "Gather structured feedback from students on course quality and instructor effectiveness.",
    category: "education",
    emoji: "🎓",
    isPaid: false,
    fields: [
      { label: "Course Name",          labelKey: "course-name",          type: "SHORT_TEXT",    isRequired: true },
      { label: "Instructor Name",      labelKey: "instructor-name",      type: "SHORT_TEXT",    isRequired: false },
      { label: "Clarity Rating",       labelKey: "clarity-rating",       type: "RATING",        isRequired: true },
      { label: "Content Depth Rating", labelKey: "content-depth-rating", type: "RATING",        isRequired: true },
      { label: "Would You Recommend?", labelKey: "would-you-recommend",  type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Yes", "No", "Maybe"] } },
      { label: "Additional Comments",  labelKey: "additional-comments",  type: "LONG_TEXT",     isRequired: false, placeholder: "Any other thoughts?" },
    ],
  },
  // 6. Bug Report
  {
    title: "Bug Report",
    description: "Structured bug reports with severity, reproduction steps, and expected behaviour.",
    category: "business",
    emoji: "🐛",
    isPaid: false,
    fields: [
      { label: "Reporter Email",     labelKey: "reporter-email",     type: "EMAIL",         isRequired: true },
      { label: "Product Area",       labelKey: "product-area",       type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Dashboard", "Form Builder", "Public Forms", "Analytics", "Auth", "API", "Other"] } },
      { label: "Severity",           labelKey: "severity",           type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Critical", "High", "Medium", "Low"] } },
      { label: "Steps to Reproduce", labelKey: "steps-to-reproduce", type: "LONG_TEXT",     isRequired: true,  placeholder: "1. Go to...\n2. Click...\n3. Observe..." },
      { label: "Expected vs Actual", labelKey: "expected-vs-actual", type: "LONG_TEXT",     isRequired: false, placeholder: "Expected: ...\nActual: ..." },
      { label: "Browser / OS",       labelKey: "browser-os",         type: "SHORT_TEXT",    isRequired: false, placeholder: "Chrome 124 / macOS 14" },
    ],
  },
  // 7. Patient Intake Form (paid)
  {
    title: "Patient Intake Form",
    description: "Comprehensive patient onboarding with medical history, current medications, and insurance details.",
    category: "health",
    emoji: "🏥",
    isPaid: true,
    fields: [
      { label: "Full Name",           labelKey: "full-name",           type: "SHORT_TEXT",    isRequired: true },
      { label: "Date of Birth",       labelKey: "date-of-birth",       type: "DATE",          isRequired: true },
      { label: "Gender",              labelKey: "gender",              type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Male", "Female", "Non-binary", "Prefer not to say"] } },
      { label: "Primary Complaint",   labelKey: "primary-complaint",   type: "LONG_TEXT",     isRequired: true,  placeholder: "Describe your main health concern..." },
      { label: "Current Medications", labelKey: "current-medications", type: "LONG_TEXT",     isRequired: false, placeholder: "List all medications and dosages..." },
      { label: "Known Allergies",     labelKey: "known-allergies",     type: "SHORT_TEXT",    isRequired: false, placeholder: "e.g. Penicillin, Peanuts" },
      { label: "Emergency Contact",   labelKey: "emergency-contact",   type: "SHORT_TEXT",    isRequired: false, placeholder: "Name & phone number" },
      { label: "Insurance ID",        labelKey: "insurance-id",        type: "SHORT_TEXT",    isRequired: false, placeholder: "Policy number" },
    ],
  },
  // 8. Market Research Survey (paid)
  {
    title: "Market Research Survey",
    description: "Multi-section survey capturing demographics, brand perception, and product usage patterns.",
    category: "research",
    emoji: "🔬",
    isPaid: true,
    fields: [
      { label: "Age Bracket",           labelKey: "age-bracket",           type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"] } },
      { label: "Gender",                labelKey: "gender",                type: "SINGLE_SELECT", isRequired: false, config: { options: ["Male", "Female", "Non-binary", "Prefer not to say"] } },
      { label: "Annual Income Range",   labelKey: "annual-income-range",   type: "SINGLE_SELECT", isRequired: false, config: { options: ["Under 3L", "3L-6L", "6L-12L", "12L-25L", "Above 25L"] } },
      { label: "Product Features Used", labelKey: "product-features-used", type: "MULTI_SELECT",  isRequired: false, config: { options: ["Form Builder", "Analytics", "Templates", "CSV Export", "Sharing"] } },
      { label: "Brand Perception",      labelKey: "brand-perception",      type: "RATING",        isRequired: true },
      { label: "What do you love?",     labelKey: "what-do-you-love",      type: "LONG_TEXT",     isRequired: false },
      { label: "What's missing?",       labelKey: "whats-missing",         type: "LONG_TEXT",     isRequired: false },
      { label: "Recommend to friends?", labelKey: "recommend-to-friends",  type: "SINGLE_SELECT", isRequired: true,  config: { options: ["Definitely", "Probably", "Neutral", "Probably not", "Definitely not"] } },
      { label: "Follow-up OK?",         labelKey: "follow-up-ok",          type: "CHECKBOX",      isRequired: false, description: "Check this if we can reach out for a 10-min call" },
      { label: "Contact Email",         labelKey: "contact-email",         type: "EMAIL",         isRequired: false },
    ],
  },
];

async function run() {
  console.log("🌱 Seeding templates...\n");

  let inserted = 0;
  let skipped = 0;

  for (const t of TEMPLATES) {
    // Check if template with this title already exists
    const existing = await db
      .select({ id: templatesTable.id })
      .from(templatesTable)
      .where(eq(templatesTable.title, t.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭  Skipping "${t.title}" (already exists)`);
      skipped++;
      continue;
    }

    await db.insert(templatesTable).values({
      title:       t.title,
      description: t.description,
      category:    t.category,
      emoji:       t.emoji,
      isPaid:      t.isPaid,
      fields:      t.fields,
      usageCount:  0,
    });

    console.log(`  ✅ Inserted "${t.title}" ${t.emoji}`);
    inserted++;
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});


