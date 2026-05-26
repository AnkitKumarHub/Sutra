"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  formId: string;
  slug?: string | null;
}

export function EmptyState({ formId, slug }: EmptyStateProps) {
  const formUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/f/${slug}` : null;

  const copyLink = () => {
    if (formUrl) {
      void navigator.clipboard.writeText(formUrl);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 gap-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-7xl select-none"
        aria-hidden
      >
        📋
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold">No responses yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Share your form to start collecting responses. Analytics will appear here once submissions come in.
        </p>
      </motion.div>

      {formUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center gap-3"
        >
          <motion.button
            onClick={copyLink}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors"
          >
            Copy Form Link
          </motion.button>
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Open Form ↗
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
