import assert from "assert";
import { SignRequest, AuthHeaders } from "../index";

suite("SignRequest", () => {
  test("correct signature", () => {
    const key = "mykey";
    const secret = "1234abcd";
    const payload =
      "eyJyZXF1ZXN0IjoiL3YxL29yZGVyL3N0YXR1cyIsIm5vbmNlIjoxMjM0NTYsIm9yZGVyX2lkIjoxODgzNH0=";

    const expectedSignature: AuthHeaders = {
      "X-GEMINI-APIKEY": key,
      "X-GEMINI-PAYLOAD": payload,
      "X-GEMINI-SIGNATURE":
        "51f2d46b8d13add5414bb73d72c1e1e1d3e1f6f8ed411960d860510df3219d0ed3514578d14f18cd1340109bf0c0385b",
    };
    const signtature = SignRequest({ key, secret, payload });
    assert.deepStrictEqual(signtature, expectedSignature);
  });
});
