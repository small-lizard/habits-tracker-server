import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import { Connection } from 'mongoose';

export type SessionRequest = Request & {
    session: Session & { userId?: string };
    userId?: string;
};

export const requireAuth = (mongoConnection: Connection) =>
    async (req: SessionRequest, res: Response, next: NextFunction) => {
        const userIdFromCookie = req.session.userId;
        const userIdFromPayload = req.query.userId || req.body?.userId;
        const sessionIdFromPayload = req.query.sessionId || req.body?.sessionId;

        if (userIdFromCookie) {
            return next();
        }

        if (userIdFromPayload && sessionIdFromPayload) {
            try {
                const session = await mongoConnection
                    .collection('sessions')
                    .findOne({ _id: sessionIdFromPayload });

                const sessionRaw = session?.session;
                const sessionData = typeof sessionRaw === 'string'
                    ? JSON.parse(sessionRaw)
                    : sessionRaw;

                if (sessionData?.userId === userIdFromPayload) {
                    (req as SessionRequest).userId = userIdFromPayload as string;
                    return next();
                }
            } catch (err) {
                console.error('Session validation error:', err);
            }
        }

        return res.status(401).json({ error: 'Not logged in' });
    };
