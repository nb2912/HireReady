// src/types/express.d.ts
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken; // Or a custom user object if you prefer
    }
  }
}
