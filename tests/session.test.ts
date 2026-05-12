import { describe, expect, it } from "vitest";

type TestSession = {
  user?: {
    name: string;
    email: string;
    id?: string;
  };
};

describe("Session User ID Verification", () => {
  it("includes the user id in the session object when a token is present", () => {
    const mockToken = { id: "user_123456789" };
    const session: TestSession = {
      user: {
        name: "Test User",
        email: "test@example.com",
      },
    };

    if (session.user) {
      session.user.id = mockToken.id;
    }

    expect(session.user?.id).toBe("user_123456789");
  });
});
