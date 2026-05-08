import { motion, AnimatePresence } from "framer-motion";
import { Trash2, History as HistoryIcon } from "lucide-react";
import type { HistoryEntry } from "@/lib/calculator";

interface Props {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onSelect, onClear }: Props) {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft h-full flex flex-col min-h-[300px] lg:min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">History</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            aria-label="Clear history"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground/70 py-12">
            Your calculations will appear here
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {history.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={() => onSelect(entry)}
                    className="w-full text-right p-3 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="text-xs text-muted-foreground truncate group-hover:text-foreground/70">
                      {entry.expression}
                    </div>
                    <div className="text-lg font-semibold gradient-text truncate">
                      = {entry.result}
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}