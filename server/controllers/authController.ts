import type { Request, Response } from 'express';
import { dbService } from '../database/db.ts';

export const authController = {
  login(req: Request, res: Response) {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = dbService.getUserByEmail(cleanEmail);

      if (!user) {
        user = {
          id: 'usr_' + Math.random().toString(36).substring(2, 10),
          name: (name && name.trim()) || cleanEmail.split('@')[0],
          email: cleanEmail,
          createdAt: new Date().toISOString()
        };
        dbService.createUser(user);

        // Create default profile
        dbService.upsertProfile({
          id: 'prof_' + user.id,
          userId: user.id,
          role: 'Software Developer',
          experience: 'Fresher',
          skills: ['Python', 'SQL', 'JavaScript'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const profile = dbService.getProfileByUserId(user.id);

      return res.json({
        user,
        profile
      });
    } catch (err: any) {
      console.error('[AuthController] login error:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  },

  getProfile(req: Request, res: Response) {
    try {
      const email = req.query.email as string;
      const userId = req.query.userId as string;

      let user;
      if (email) {
        user = dbService.getUserByEmail(email);
      } else if (userId) {
        user = dbService.getUserById(userId);
      } else {
        user = dbService.getUserByEmail('mayukhatokala@gmail.com');
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = dbService.getProfileByUserId(user.id);
      return res.json({ user, profile });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to load profile' });
    }
  },

  updateProfile(req: Request, res: Response) {
    try {
      const { userId, role, experience, skills } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const profile = dbService.upsertProfile({
        id: 'prof_' + userId,
        userId,
        role: role || 'Software Developer',
        experience: experience || 'Fresher',
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return res.json({ message: 'Profile updated successfully', profile });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};
