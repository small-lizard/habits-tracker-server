import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import { Connection } from 'mongoose';

export type SessionRequest = Request & {
    session: Session & { userId?: string };
    userId?: string;
};

export const requireAuth = (mongoConnection: Connection) =>
    async (req: SessionRequest, res: Response, next: NextFunction) => {
        const cookieUserId = req.session?.userId;
        const sessionId = req.headers["x-session-id"] as string | undefined;

        if (cookieUserId) {
            req.userId = cookieUserId;
            return next();
        }

        if (!cookieUserId && !sessionId) {
            return res.status(401).json({ error: "Not logged in" });
        }

        try {
            const session = await mongoConnection
                .collection<any>("sessions")
                .findOne({ _id: sessionId });

            if (!session) {
                return res.status(401).json({ error: "Invalid session" });
            }

            if (new Date(session.expires) <= new Date()) {
                return res.status(401).json({ error: "Session expired" });
            }

            const sessionData = JSON.parse(session.session);

            if (!sessionData?.userId) {
                return res.status(401).json({ error: "Invalid session data" });
            }
            req.userId = sessionData.userId;
            return next();

        } catch (error) {
            console.error("Auth middleware error:", error);
            return res.status(401).json({ error: "Not logged in" });
        }
    };