import { describe, expect, it } from "vitest";
import { useAppStore } from "../store/app";

describe("app store", () => {
  it("starts with an empty alarm list", () => {
    const state = useAppStore.getState();
    expect(state.alarms).toEqual([]);
  });

  it("can add an alarm", () => {
    const state = useAppStore.getState();
    state.addAlarm({
      id: "test-alarm",
      hour: 7,
      minute: 0,
      days: ["mon"],
      enabled: true,
      label: "Test",
      soundUrl: "",
      aiPrompt: "",
    });
    expect(useAppStore.getState().alarms).toHaveLength(1);
  });

  it("can toggle an alarm", () => {
    const state = useAppStore.getState();
    state.toggleAlarm("test-alarm");
    expect(useAppStore.getState().alarms[0].enabled).toBe(false);
  });

  it("can remove an alarm", () => {
    const state = useAppStore.getState();
    state.removeAlarm("test-alarm");
    expect(useAppStore.getState().alarms).toHaveLength(0);
  });
});
