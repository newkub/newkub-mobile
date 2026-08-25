import { describe, expect, it } from "vitest";
import { useInterval } from "../hooks/use-interval";
import { renderHook } from "@testing-library/react";

describe("useInterval", () => {
  it("does not set up an interval when delay is null", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));
    expect(callback).not.toHaveBeenCalled();
  });
});
