import { Preferences } from "@capacitor/preferences";

export async function get<T>(key: string, fallback?: T): Promise<T | undefined> {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function set<T>(key: string, value: T): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

export async function remove(key: string): Promise<void> {
  await Preferences.remove({ key });
}

export async function keys(): Promise<string[]> {
  const { keys } = await Preferences.keys();
  return keys;
}
