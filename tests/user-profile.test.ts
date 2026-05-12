import { describe, expect, it } from "vitest";

import { User } from "../src/models/User";

describe("User Profile Defaults", () => {
  it('assigns the default coach name "CoachClaw" when none is provided', () => {
    const user = new User({
      googleId: "google-999",
      email: "coach@example.com",
      name: "Coach User",
    });

    expect(user.coachName).toBe("CoachClaw");
  });
});
