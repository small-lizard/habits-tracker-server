import { Request, Response } from "express";
import UserRepository from "../repositories/UserRepository";
import { Session } from "express-session";

interface SessionRequest extends Request {
    session: Session & { userId?: string };
}

class UserController {
    private userRepository: UserRepository;

    constructor({ userRepository }: { userRepository: UserRepository }) {
        this.userRepository = userRepository;
    }

    addUser = async (req: Request, res: Response) => {
        try {
            const user = await this.userRepository.addUser(req.body);
            (req as SessionRequest).session.userId = user._id;
            res.status(200).json({ message: 'User created and logged in', userId: user._id, name: user.name });
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const user = await this.userRepository.login(req.body);
            (req as SessionRequest).session.userId = user._id;

            res.status(200).json({ message: 'Successful login', userId: user._id, name: user.name });
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }


    changePassword = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Not logged in' });
            }
            const user = await this.userRepository.changePassword(userId, req.body.password);
            res.status(200).json({ message: 'Password changed', userId: user._id });
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    logout = async (req: Request, res: Response) => {
        req.session.destroy((err?: Error) => {
            if (err) {
                console.log('destroy callback, err:', err);
                console.error(err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Successfully logged out' });
        });
    }

    delete = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            if (!userId) return res.status(401).json({ message: 'Not logged in' });

            await this.userRepository.delete(userId);

            req.session.destroy((err?: Error) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ message: 'Account deleted, but logout failed' });
                }
                res.clearCookie('connect.sid');
                res.json({ message: 'Account deleted and logged out', userId });
            });
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    checkIsAuth = async (req: Request, res: Response) => {
        if ((req as SessionRequest).session.userId ) {
            res.json({ isAuth: true, userId: (req as SessionRequest).session.userId });
        } else {
            res.json({ isAuth: false });
        }
    }
}

export default UserController;
