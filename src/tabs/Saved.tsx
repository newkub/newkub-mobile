import { useState } from "react";
import { Bookmark, Plus, Trash2, ExternalLink } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { generateUUID } from "../lib/uuid";

interface SavedItem {
  id: string;
  title: string;
  url: string;
}

export function SavedTab() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function add() {
    if (!title.trim() || !url.trim()) return;
    haptic("success");
    setItems([...items, { id: generateUUID(), title, url }]);
    setTitle("");
    setUrl("");
    showStatus("Saved item added", "success");
  }

  function remove(id: string) {
    haptic("light");
    setItems(items.filter((i) => i.id !== id));
    showStatus("Removed", "info");
  }

  return (
    <div className="flex h-full flex-col px-4">
      <div className="mb-4 space-y-2">
        <Input value={title} onChange={setTitle} placeholder="Title" />
        <div className="flex gap-2">
          <Input value={url} onChange={setUrl} placeholder="https://..." className="flex-1" />
          <Button onClick={add}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-sm text-text-secondary">No saved links yet</p>}
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="flex-1 truncate text-sm text-text">{i.title}</span>
            <a href={i.url} target="_blank" rel="noreferrer" onClick={() => haptic("light")} className="text-text-secondary hover:text-primary">
              <ExternalLink className="h-4 w-4" />
            </a>
            <button onClick={() => remove(i.id)} className="text-text-secondary hover:text-rose-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
