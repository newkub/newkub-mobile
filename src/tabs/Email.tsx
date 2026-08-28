import { useState } from "react";
import { Send, Inbox, Trash2 } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

interface Draft {
  id: string;
  to: string;
  subject: string;
  body: string;
}

export function EmailTab() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function send() {
    if (!to.trim() || !subject.trim()) return;
    haptic("success");
    const draft: Draft = { id: crypto.randomUUID(), to, subject, body };
    setDrafts([draft, ...drafts]);
    setTo("");
    setSubject("");
    setBody("");
    showStatus("Email draft saved", "success");
  }

  function remove(id: string) {
    haptic("light");
    setDrafts(drafts.filter((d) => d.id !== id));
    showStatus("Draft removed", "info");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <div className="mb-4 space-y-2">
        <Input value={to} onChange={setTo} placeholder="To" />
        <Input value={subject} onChange={setSubject} placeholder="Subject" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message"
          className="h-24 w-full resize-none rounded-2xl border border-border bg-surface-2 p-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
        />
        <Button onClick={send} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Save draft
        </Button>
      </div>
      <div className="space-y-2">
        {drafts.length === 0 && <p className="text-center text-sm text-text-secondary"><Inbox className="mx-auto mb-1 h-5 w-5" /> No drafts yet</p>}
        {drafts.map((d) => (
          <div key={d.id} className="rounded-2xl bg-surface-2 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-text">{d.subject}</span>
              <button onClick={() => remove(d.id)} className="text-text-secondary hover:text-rose-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary">To: {d.to}</p>
            <p className="mt-1 text-xs text-muted line-clamp-2">{d.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
