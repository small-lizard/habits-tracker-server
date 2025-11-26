import { Request, Response } from "express";
import UserRepository from "../repositories/UserRepository";
import { Session } from "express-session";
import HabitRepository from "../repositories/HabitRepository";

interface SessionRequest extends Request {
    session: Session & { userId?: string };
}

class UserController {
    private userRepository: UserRepository;
    private habitRepository: HabitRepository;

    constructor({ userRepository, habitRepository }: {
        userRepository: UserRepository;
        habitRepository: HabitRepository;
    }) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
    }

    addUser = async (req: Request, res: Response) => {
        try {
            const user = await this.userRepository.addUser(req.body);

            const sessionReq = req as SessionRequest;
            sessionReq.session.userId = user._id;

            await new Promise<void>((resolve, reject) => {
                sessionReq.session.save(err => err ? reject(err) : resolve());
            });

            res.status(200).json({ message: 'User created and logged in', userId: user._id, name: user.name, email: user.email });
        } catch (error) {
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const user = await this.userRepository.login(req.body);

            const sessionReq = req as SessionRequest;
            sessionReq.session.userId = user._id;

            await new Promise<void>((resolve, reject) => {
                sessionReq.session.save(err => err ? reject(err) : resolve());
            });

            res.status(200).json({ message: 'Successful login', userId: user._id, name: user.name, email: user.email });
        } catch (error) {
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    changePassword = async (req: Request, res: Response) => {
        try {

            const userId = (req as SessionRequest).session.userId;
            if (!userId) return res.status(401).json({ message: 'Not logged in' });

            await this.userRepository.changePassword(userId, req.body);
            res.status(200).json({ message: 'Password changed', userId: userId });
        } catch (error) {
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    logout = async (req: Request, res: Response) => {
        req.session.destroy(err => {
            if (err) {
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

            await this.habitRepository.deleteAllByUserId(userId);

            await this.userRepository.delete(userId);

            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ message: 'Account deleted, but logout failed' });
                }
                res.clearCookie('connect.sid');
                res.json({ message: 'Account deleted and logged out', userId });
            });
        } catch (error) {
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    checkIsAuth = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId;
        if (userId) {
            const user = await this.userRepository.checkIsAuth(userId);
            res.json({ isAuth: true, userId, user });
        } else {
            res.json({ isAuth: false });
        }
    }
}

export default UserController;

