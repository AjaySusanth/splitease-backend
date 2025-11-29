import { Request, Response } from 'express';
import { findUserById } from './user.service';
import { omitPassword } from './user.utils';

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: omitPassword(user) });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
