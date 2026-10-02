import { afterEach, it, expect, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
vi.mock("../src/features/posters/posters.api", () => ({ getPoster: vi.fn() }));
import { getPoster } from "../src/features/posters/posters.api";
import { usePoster } from "../src/features/posters/usePoster";
import type { Poster } from "../src/types/models";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetAllMocks();
});
it("polls generating jobs with backoff and stops on completion", async () => {
  vi.useFakeTimers();
  vi.mocked(getPoster)
    .mockResolvedValueOnce({ _id: "id", status: "generating" } as Poster)
    .mockResolvedValue({ _id: "id", status: "completed" } as Poster);
  const { result } = renderHook(() => usePoster("id"));
  await act(async () => {
    await Promise.resolve();
  });
  expect(result.current.poster?.status).toBe("generating");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(result.current.poster?.status).toBe("completed");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(getPoster).toHaveBeenCalledTimes(2);
});
it("stops on failure and refresh restarts polling", async () => {
  vi.useFakeTimers();
  vi.mocked(getPoster).mockResolvedValue({
    _id: "id",
    status: "failed",
  } as Poster);
  const { result } = renderHook(() => usePoster("id"));
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(getPoster).toHaveBeenCalledTimes(1);
  await act(async () => {
    result.current.refresh();
  });
  expect(getPoster).toHaveBeenCalledTimes(2);
});
it("cleans up pending polling when unmounted", async () => {
  vi.useFakeTimers();
  vi.mocked(getPoster).mockResolvedValue({
    _id: "id",
    status: "generating",
  } as Poster);
  const { unmount } = renderHook(() => usePoster("id"));
  await act(async () => {
    await Promise.resolve();
  });
  unmount();
  await vi.advanceTimersByTimeAsync(10000);
  expect(getPoster).toHaveBeenCalledTimes(1);
});
