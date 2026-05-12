import { describe, expect, it } from "vitest";

import { User } from "../src/models/User";

describe("Auth user mapping", () => {
  it("builds a user document from a successful Google sign-in profile", () => {
    const mockUser = {
      id: "google-123",
      email: "test@example.com",
      name: "Test User",
      image: "https://example.com/image.jpg",
    };

    const user = new User({
      googleId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      image: mockUser.image,
    });

    expect(user.googleId).toBe("google-123");
    expect(user.email).toBe("test@example.com");
    expect(user.coachName).toBe("CoachClaw");
  });
});
