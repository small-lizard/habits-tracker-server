import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import { Connection } from 'mongoose';

export type SessionRequest = Request & {
    session: Session & { userId?: string };
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

                console.log('session from db:', JSON.stringify(session));

                if (session?.session?.userId === userIdFromPayload) {
                    req.session.userId = userIdFromPayload;
                    return next();
                }
            } catch (err) {
                console.error('Session validation error:', err);
            }
        }

        return res.status(401).json({ error: 'Not logged in' });
    };
