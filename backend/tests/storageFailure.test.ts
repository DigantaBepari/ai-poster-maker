import { expect, it } from "vitest";
import { storageFailure } from "../src/services/storageFailure.js";
it("classifies storage failures without leaking provider messages", () => {
  expect(storageFailure({ http_code: 401 }).code).toBe("STORAGE_AUTH_FAILED");
  expect(storageFailure({ http_code: 429 }).code).toBe("STORAGE_LIMIT");
  expect(storageFailure({ code: "ETIMEDOUT" }).code).toBe(
    "STORAGE_CONNECTION_FAILED",
  );
  const failure = storageFailure({ message: "secret-key private-url" });
  expect(failure.code).toBe("UPLOAD_FAILED");
  expect(failure.message).not.toContain("secret-key");
  expect(storageFailure(null).code).toBe("UPLOAD_FAILED");
});
