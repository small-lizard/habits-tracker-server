import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";

export type SessionRequest = Request & {
    session: Session & { userId?: string };
};

export const requireAuth = (req: SessionRequest, res: Response, next: NextFunction) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    next();
};

