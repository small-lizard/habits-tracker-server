import { Request, Response } from "express";
import UserRepository from "../repositories/UserRepository";
import { Session } from "express-session";
import HabitRepository from "../repositories/HabitRepository";
import bcrypt from 'bcryptjs';

type SessionRequest = Request & {
    session: Session & { userId?: string };
};

type UserControllerDeps = {
    userRepository: UserRepository;
    habitRepository: HabitRepository;
};

class UserController {
    private userRepository: UserRepository;
    private habitRepository: HabitRepository;

    constructor({ userRepository, habitRepository }: UserControllerDeps) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
    }

    public addUser = async (req: Request, res: Response) => {
        const existingUser = await this.userRepository.findUserByEmail(req.body.email.toLowerCase());
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        try {
            const user = await this.userRepository.addUser(req.body);

            const sessionReq = req as SessionRequest;
            sessionReq.session.userId = user.id;

            await new Promise<void>((resolve, reject) => {
                sessionReq.session.save(err => err ? reject(err) : resolve());
            });

            res.status(200).json({
                message: 'User created and logged in',
                userId: user.id,
                name: user.name,
                email: user.email
            });

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public login = async (req: Request, res: Response) => {
        const user = req.body;

        const existingUser = await this.userRepository.findUserByEmail(req.body.email.toLowerCase());
        if (!existingUser) {
            return res.status(401).json({ error: "A user with this email doesn't exists." });
        }

        const passwordCompare = await bcrypt.compare(user.password, existingUser.password);
        if (!passwordCompare) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        try {
            const sessionReq = req as SessionRequest;
            sessionReq.session.userId = existingUser.id;

            await new Promise<void>((resolve, reject) => {
                sessionReq.session.save(err => err ? reject(err) : resolve());
            });

            res.status(200).json({
                message: 'Successful login',
                userId: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public changePassword = async (req: Request, res: Response) => {
        const user = req.body;
        const userId = (req as SessionRequest).session.userId as string;

        const existingUser = await this.userRepository.findUserById(user.id);
        if (!existingUser) {
            return res.status(401).json({ error: 'User not found' });
        }

        const passwordCompare = await bcrypt.compare(user.password, existingUser.password);
        if (!passwordCompare) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        try {
            await this.userRepository.changePassword(userId, user.newPassword);

            res.status(200).json({ message: 'Password changed', userId: userId });

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public logout = async (req: Request, res: Response) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Successfully logged out' });
        });
    }

    public delete = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId as string;

        try {
            await this.habitRepository.deleteAllByUserId(userId);

            await this.userRepository.delete(userId);

            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ error : 'Account deleted, but logout failed' });
                }
                res.clearCookie('connect.sid');
                res.status(200).json({ message: 'Account deleted and logged out', userId: userId });
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public checkIsAuth = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId;

        if (!userId) {
            return res.json({ isAuth: false });
        }

        try {
            const user = await this.userRepository.findUserById(userId);

            if (!user) {
                return res.json({ isAuth: false });
            }

            res.json({ isAuth: true, userId, name: user.name, email: user.email });
        } catch (err) {
            res.json({ isAuth: false });
        }
    }
}

export default UserController;

