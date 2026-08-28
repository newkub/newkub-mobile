import type { TabDefinition } from "../store/app";

export function generateTabFromPrompt(prompt: string): TabDefinition {
  const text = prompt.toLowerCase();

  if (text.includes("task") || text.includes("งาน") || text.includes("todo")) {
    return { id: `custom-${Date.now()}`, label: "My Tasks", icon: "i-mdi-check-circle", visible: true, type: "custom" };
  }
  if (text.includes("note") || text.includes("notes") || text.includes("จด") || text.includes("memo")) {
    return { id: `custom-${Date.now()}`, label: "My Notes", icon: "i-mdi-note", visible: true, type: "custom" };
  }
  if (text.includes("email") || text.includes("mail")) {
    return { id: `custom-${Date.now()}`, label: "My Inbox", icon: "i-mdi-email", visible: true, type: "custom" };
  }
  if (text.includes("devin") || text.includes("agent") || text.includes("ai")) {
    return { id: `custom-${Date.now()}`, label: "Devin Agent", icon: "i-mdi-robot", visible: true, type: "custom" };
  }
  if (text.includes("saved") || text.includes("bookmark") || text.includes("save")) {
    return { id: `custom-${Date.now()}`, label: "My Saved", icon: "i-mdi-bookmark", visible: true, type: "custom" };
  }
  if (text.includes("clock") || text.includes("time") || text.includes("เวลา")) {
    return { id: `custom-${Date.now()}`, label: "My Clock", icon: "i-mdi-clock", visible: true, type: "custom" };
  }

  return { id: `custom-${Date.now()}`, label: prompt.slice(0, 20) || "New Tab", icon: "i-mdi-sparkles", visible: true, type: "custom" };
}
