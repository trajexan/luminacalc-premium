import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Moon, Sun, Sparkles } from "lucide-react";
import { CalcButton } from "./CalcButton";
import { HistoryPanel } from "./HistoryPanel";
import { evalExpression, formatNumber, type HistoryEntry } from "@/lib/calculator";

const OP_KEYS: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function isOpChar(ch: string) {
  return ch === "+" || ch === "−" || ch === "×" || ch === "÷";
}

export function Calculator() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const lastChar = expr.slice(-1);

  const inputDigit = useCallback((d: string) => {
    setExpr((prev) => {
      if (justEvaluated) {
        setJustEvaluated(false);
        setDisplay(d === "." ? "0." : d);
        return d === "." ? "0." : d;
      }
      // prevent multiple dots in current number
      if (d === ".") {
        const tokens = prev.split(/[+\-−×÷%]/);
        const current = tokens[tokens.length - 1];
        if (current.includes(".")) return prev;
        if (current === "") {
          const next = prev + "0.";
          setDisplay("0.");
          return next;
        }
      }
      const next = prev + d;
      // update display to current number being typed
      const tokens = next.split(/([+\-−×÷%])/);
      setDisplay(tokens[tokens.length - 1] || "0");
      return next;
    });
  }, [justEvaluated]);

  const inputOperator = useCallback((op: string) => {
    setJustEvaluated(false);
    setExpr((prev) => {
      if (prev === "" && op === "−") return "−";
      if (prev === "") return prev;
      if (isOpChar(prev.slice(-1))) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  }, []);

  const clearAll = useCallback(() => {
    setExpr("");
    setDisplay("0");
    setJustEvaluated(false);
  }, []);

  const clearEntry = useCallback(() => {
    setExpr((prev) => {
      // remove trailing number
      const m = prev.match(/(.*?)([0-9.]+)$/);
      if (m) {
        setDisplay("0");
        return m[1];
      }
      setDisplay("0");
      return prev.slice(0, -1);
    });
  }, []);

  const backspace = useCallback(() => {
    if (justEvaluated) { clearAll(); return; }
    setExpr((prev) => {
      const next = prev.slice(0, -1);
      const tokens = next.split(/([+\-−×÷%])/);
      setDisplay(tokens[tokens.length - 1] || "0");
      return next;
    });
  }, [justEvaluated, clearAll]);

  const equals = useCallback(() => {
    if (!expr) return;
    try {
      const value = evalExpression(expr);
      const formatted = formatNumber(value);
      if (formatted === "Error") {
        setDisplay("Error");
        return;
      }
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        expression: expr,
        result: formatted,
      };
      setHistory((h) => [entry, ...h].slice(0, 50));
      setDisplay(formatted);
      setExpr(formatted.replace("-", "−"));
      setJustEvaluated(true);
    } catch {
      setDisplay("Error");
    }
  }, [expr]);

  const toggleSign = useCallback(() => {
    setExpr((prev) => {
      const m = prev.match(/(.*?)(−?[0-9.]+)$/);
      if (!m) return prev;
      const [, head, num] = m;
      const toggled = num.startsWith("−") ? num.slice(1) : "−" + num;
      const next = head + toggled;
      setDisplay(toggled);
      return next;
    });
  }, []);

  const applyUnary = useCallback((fn: (n: number) => number, label: (s: string) => string) => {
    try {
      const current = expr ? evalExpression(expr) : parseFloat(display);
      const value = fn(current);
      const formatted = formatNumber(value);
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        expression: label(expr || display),
        result: formatted,
      };
      setHistory((h) => [entry, ...h].slice(0, 50));
      setDisplay(formatted);
      setExpr(formatted.replace("-", "−"));
      setJustEvaluated(true);
    } catch {
      setDisplay("Error");
    }
  }, [expr, display]);

  const sqrt = () => applyUnary(Math.sqrt, (s) => `√(${s})`);
  const square = () => applyUnary((n) => n * n, (s) => `(${s})²`);
  const percent = () => {
    setExpr((prev) => prev + "%");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {/* noop */}
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setExpr(entry.result.replace("-", "−"));
    setDisplay(entry.result);
    setJustEvaluated(true);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { inputDigit(k); return; }
      if (k === ".") { inputDigit("."); return; }
      if (k in OP_KEYS) { inputOperator(OP_KEYS[k]); return; }
      if (k === "%") { percent(); return; }
      if (k === "Enter" || k === "=") { e.preventDefault(); equals(); return; }
      if (k === "Backspace") { backspace(); return; }
      if (k === "Escape") { clearAll(); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputDigit, inputOperator, equals, backspace, clearAll]);

  const expressionPreview = useMemo(() => {
    return justEvaluated ? "" : expr || "";
  }, [expr, justEvaluated]);

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:py-10 flex flex-col">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Lumina<span className="gradient-text">Calc</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">A premium calculator experience</p>
          </div>
        </div>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
          className="glass h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calculator */}
        <div className="glass rounded-3xl p-5 sm:p-7 shadow-soft">
          {/* Display */}
          <div className="rounded-2xl bg-background/30 dark:bg-black/20 p-5 mb-5 min-h-[140px] flex flex-col justify-end">
            <div className="text-right text-sm text-muted-foreground h-6 truncate">
              {expressionPreview}
            </div>
            <div className="flex items-end justify-end gap-3">
              <button
                onClick={copy}
                aria-label="Copy result"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-white/10 mb-1"
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </button>
              <motion.div
                key={display}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-right text-4xl sm:text-6xl font-semibold tracking-tight tabular-nums break-all"
              >
                {display}
              </motion.div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <CalcButton variant="function" onClick={clearAll}>AC</CalcButton>
            <CalcButton variant="function" onClick={clearEntry}>C</CalcButton>
            <CalcButton variant="function" onClick={percent}>%</CalcButton>
            <CalcButton variant="operator" onClick={() => inputOperator("÷")}>÷</CalcButton>

            <CalcButton variant="function" onClick={square} ariaLabel="square">x²</CalcButton>
            <CalcButton variant="function" onClick={sqrt} ariaLabel="square root">√</CalcButton>
            <CalcButton variant="function" onClick={toggleSign} ariaLabel="toggle sign">±</CalcButton>
            <CalcButton variant="operator" onClick={() => inputOperator("×")}>×</CalcButton>

            <CalcButton onClick={() => inputDigit("7")}>7</CalcButton>
            <CalcButton onClick={() => inputDigit("8")}>8</CalcButton>
            <CalcButton onClick={() => inputDigit("9")}>9</CalcButton>
            <CalcButton variant="operator" onClick={() => inputOperator("−")}>−</CalcButton>

            <CalcButton onClick={() => inputDigit("4")}>4</CalcButton>
            <CalcButton onClick={() => inputDigit("5")}>5</CalcButton>
            <CalcButton onClick={() => inputDigit("6")}>6</CalcButton>
            <CalcButton variant="operator" onClick={() => inputOperator("+")}>+</CalcButton>

            <CalcButton onClick={() => inputDigit("1")}>1</CalcButton>
            <CalcButton onClick={() => inputDigit("2")}>2</CalcButton>
            <CalcButton onClick={() => inputDigit("3")}>3</CalcButton>
            <CalcButton variant="equals" onClick={equals}>=</CalcButton>

            <CalcButton onClick={() => inputDigit("0")} className="col-span-2">0</CalcButton>
            <CalcButton onClick={() => inputDigit(".")}>.</CalcButton>
            <CalcButton variant="function" onClick={backspace} ariaLabel="backspace">⌫</CalcButton>
          </div>
        </div>

        {/* History */}
        <HistoryPanel
          history={history}
          onSelect={loadFromHistory}
          onClear={() => setHistory([])}
        />
      </div>

      <footer className="max-w-6xl mx-auto w-full mt-6 text-center text-xs text-muted-foreground">
        Tip: use your keyboard — numbers, + − * /, Enter, Backspace, Esc
      </footer>
    </div>
  );
}