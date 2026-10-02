import { expect, it } from "vitest";
import { downloadFailure } from "../src/services/poster/downloadFailure.js";
it("reports blocked PDF delivery without exposing provider headers", () => {
  const response = new Response(null, {
    status: 401,
    headers: {
      "x-cld-error": "delivery blocked while account is untrusted private-url",
    },
  });
  expect(downloadFailure("pdf", response).code).toBe("PDF_DELIVERY_BLOCKED");
  expect(downloadFailure("pdf", response).message).not.toContain("private-url");
  expect(downloadFailure("png", response).code).toBe("DOWNLOAD_FAILED");
});
it("does not classify missing PDFs as delivery restrictions", () => {
  expect(downloadFailure("pdf", new Response(null, { status: 404 })).code).toBe(
    "DOWNLOAD_FAILED",
  );
});
