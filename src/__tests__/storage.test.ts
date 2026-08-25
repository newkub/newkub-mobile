import { describe, expect, it } from "vitest";
import { get, set, remove } from "../lib/storage";

describe("storage", () => {
  it("set and get roundtrip", async () => {
    await set("foo", { bar: 1 });
    const value = await get<{ bar: number; }>("foo");
    expect(value).toEqual({ bar: 1 });
  });

  it("remove deletes a key", async () => {
    await set("tmp", 1);
    await remove("tmp");
    expect(await get<number>("tmp")).toBeUndefined();
  });

  it("returns fallback for missing keys", async () => {
    expect(await get("missing", 42)).toBe(42);
  });
});
