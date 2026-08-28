import type { TabDefinition } from "../store/app";

export function generateTabFromPrompt(prompt: string): TabDefinition {
  const text = prompt.toLowerCase();

  if (text.includes("task") || text.includes("งาน") || text.includes("todo")) {
    return { id: `custom-${Date.now()}`, label: "My Tasks", icon: "CheckSquare", visible: true, type: "custom" };
  }
  if (text.includes("note") || text.includes("notes") || text.includes("จด") || text.includes("memo")) {
    return { id: `custom-${Date.now()}`, label: "My Notes", icon: "NotebookPen", visible: true, type: "custom" };
  }
  if (text.includes("email") || text.includes("mail") || text.includes("mail")) {
    return { id: `custom-${Date.now()}`, label: "My Inbox", icon: "Inbox", visible: true, type: "custom" };
  }
  if (text.includes("devin") || text.includes("agent") || text.includes("ai") || text.includes("agent")) {
    return { id: `custom-${Date.now()}`, label: "Devin Agent", icon: "Bot", visible: true, type: "custom" };
  }
  if (text.includes("saved") || text.includes("bookmark") || text.includes("save")) {
    return { id: `custom-${Date.now()}`, label: "My Saved", icon: "Bookmark", visible: true, type: "custom" };
  }
  if (text.includes("clock") || text.includes("time") || text.includes("เวลา")) {
    return { id: `custom-${Date.now()}`, label: "My Clock", icon: "Clock", visible: true, type: "custom" };
  }

  return { id: `custom-${Date.now()}`, label: prompt.slice(0, 20) || "New Tab", icon: "Sparkles", visible: true, type: "custom" };
}
