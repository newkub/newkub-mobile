import { useState } from "react";
import { Wand2, XCircle, Loader2 } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

export function AiFixPanel() {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function fix() {
    if (!error.trim()) return;
    haptic("light");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, code }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.suggestion);
        showStatus("AI Fix suggestion ready", "success");
      } else {
        showStatus(data.error ?? "AI Fix failed", "error");
      }
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "AI Fix failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-text">
        <Wand2 className="h-4 w-4 text-primary" /> AI Fix
      </h3>
      <p className="mb-3 text-sm text-text-secondary">Paste an error or describe a problem to get a fix suggestion.</p>
      <Input value={error} onChange={setError} placeholder="Error message or stack trace" className="mb-2" />
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Optional code snippet"
        className="mb-3 h-24 w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
      />
      <Button onClick={fix} disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        {loading ? "Analyzing..." : "Get AI Fix"}
      </Button>
      {result && (
        <div className="mt-3 rounded-xl bg-surface p-3 text-sm text-text">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{result}</pre>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-text-secondary hover:text-text">
            <XCircle className="mr-1 inline h-3 w-3" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
