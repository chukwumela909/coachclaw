import { describe, it, expect } from 'vitest';
import { User } from '../src/models/User';
import mongoose from 'mongoose';

describe('User Profile Defaults', () => {
  it('should assign the default coach name "CoachClaw" when none is provided', async () => {
    const mockUser = {
      googleId: 'google-999',
      email: 'coach@example.com',
      name: 'Coach User',
    };

    const user = await User.create(mockUser);
    expect(user.coachName).toBe('CoachClaw');
  });
});
