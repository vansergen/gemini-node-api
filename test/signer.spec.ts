import * as assert from "assert";
import { SignRequest, AuthHeaders } from "../";

suite("SignRequest", () => {
  test("correct signature", () => {
    const key = "mykey";
    const secret = "1234abcd";
    const options = {
      request: "/v1/order/status",
      nonce: 123456,
      order_id: 18834
    };

    const expectedSignature: AuthHeaders = {
      "X-GEMINI-APIKEY": "mykey",
      "X-GEMINI-PAYLOAD":
        "eyJyZXF1ZXN0IjoiL3YxL29yZGVyL3N0YXR1cyIsIm5vbmNlIjoxMjM0NTYsIm9yZGVyX2lkIjoxODgzNH0=",
      "X-GEMINI-SIGNATURE":
        "51f2d46b8d13add5414bb73d72c1e1e1d3e1f6f8ed411960d860510df3219d0ed3514578d14f18cd1340109bf0c0385b"
    };
    const signtature = SignRequest({ key, secret, options });
    assert.deepStrictEqual(signtature, expectedSignature);
  });
});
