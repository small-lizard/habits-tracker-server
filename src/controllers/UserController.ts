import { Request, Response } from "express";
import { UserRepository } from "@repositories/UserRepository.js";
import { Session } from "express-session";
import { HabitRepository } from "@repositories/HabitRepository.js";
import bcrypt from 'bcryptjs';
import otpGenerator from "otp-generator";
import { OtpModel } from "@models/otpSchema.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

type SessionRequest = Request & {
    session: Session & { userId?: string };
};

type UserControllerDeps = {
    userRepository: UserRepository;
    habitRepository: HabitRepository;
};

export class UserController {
    private userRepository: UserRepository;
    private habitRepository: HabitRepository;

    private createUserSession = async (req: SessionRequest, userId: string) => {
        const sessionReq = req as SessionRequest;
        sessionReq.session.userId = userId;

        await new Promise<void>((resolve, reject) => {
            sessionReq.session.save(err => err ? reject(err) : resolve());
        });
    }

    private syncUserHabits = async (userId: string, habits?: any[]) => {
        if (habits?.length) {
            await this.habitRepository.sync(userId, habits);
        }
    }

    constructor({ userRepository, habitRepository }: UserControllerDeps) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
    }

    public addUser = async (req: Request, res: Response) => {
        const userData = {
            id: req.body.id,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isVerified: false,
            blockedUntil: null
        }

        const isUserExist = await this.userRepository.findUserByEmail(userData.email.toLowerCase());
        if (isUserExist && isUserExist.isVerified) {
            return res.status(409).json({ code: "USER_ALREADY_EXISTS" });
        }

        if (isUserExist && isUserExist.blockedUntil && isUserExist.blockedUntil.getTime() > Date.now()) {
            const secondsLeft = Math.ceil((isUserExist.blockedUntil.getTime() - Date.now()) / 1000);
            return res
                .status(429)
                .set('Retry-After', String(secondsLeft))
                .json({ error: "Too many attempts." });
        }

        try {

            const user = isUserExist && !isUserExist.isVerified
                ? isUserExist
                : await this.userRepository.addUser(userData);

            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            const salt = await bcrypt.genSalt(10);
            const hashedOTP = await bcrypt.hash(otp, salt);

            await OtpModel.deleteMany({ email: user.email });

            await OtpModel.create({ email: user.email, code: hashedOTP, createdAt: new Date() });

            await sendVerificationEmail(user.email, otp, user.name, req.body.savedLang);

            res.status(200).json({ message: 'Verification code sent to email' });

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public sendOTP = async (req: Request, res: Response) => {
        const { email, name, savedLang } = req.body;

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        await OtpModel.deleteMany({ email: email });
        await OtpModel.create({ email: email, code: hashedOTP, createdAt: new Date() });

        await sendVerificationEmail(email, otp, name, savedLang);

        res.status(200).json({ message: 'Verification code sent to email' });
    }

    public verifyEmail = async (req: Request, res: Response) => {
        const { email, code, habits } = req.body;

        const otpRecord = await OtpModel.findOne({ email });
        const user = await this.userRepository.findUserByEmail(email.toLowerCase());
        if (!user) {
            return res.status(404).json({ code: "USER_NOT_FOUND_BY_EMAIL" });
        }

        if (user.blockedUntil && user.blockedUntil.getTime() > Date.now()) {
            const secondsLeft = Math.ceil((user.blockedUntil.getTime() - Date.now()) / 1000);
            return res
                .status(429)
                .set('Retry-After', String(secondsLeft))
                .json({ error: "Too many attempts." });
        }

        if (!otpRecord || otpRecord.createdAt.getTime() + 5 * 60 * 1000 < Date.now()) {
            return res.status(400).json({ code: "CODE_EXPIRED" });
        }

        const otpCompare = await bcrypt.compare(code, otpRecord.code);
        if (!otpCompare) {
            otpRecord.attempts += 1;

            if (otpRecord.attempts >= 4) {
                user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);

                await this.userRepository.updateUserData(user.id, { blockedUntil: user.blockedUntil });

                otpRecord.attempts = 0;
            }

            await otpRecord.save();

            return res.status(401).json({ code: "INVALID_VERIFICATION_CODE" });
        }

        try {
            await this.userRepository.updateUserData(user.id, { isVerified: true });

            await this.createUserSession(req, user.id);

            await this.syncUserHabits(user.id, habits);

            await OtpModel.deleteMany({ email });

            res.status(200).json({
                message: 'User created and logged in',
                userId: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public login = async (req: Request, res: Response) => {
        const user = {
            email: req.body.email,
            password: req.body.password
        }

        const existingUser = await this.userRepository.findUserByEmail(user.email.toLowerCase());
        if (!existingUser) {
            return res.status(404).json({ code: "USER_NOT_FOUND_BY_EMAIL" });
        }

        const isPasswordValid = await bcrypt.compare(user.password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ code: "INVALID_PASSWORD" });
        }

        if (!existingUser.isVerified) {
            return res.status(403).json({ code: "EMAIL_NOT_VERIFIED" });
        }

        try {
            await this.createUserSession(req, existingUser.id);

            await this.syncUserHabits(existingUser.id, req.body.habits);

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

        const existingUser = await this.userRepository.findUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ code: "USER_NOT_FOUND" });
        }

        const passwordCompare = await bcrypt.compare(user.password, existingUser.password);
        if (!passwordCompare) {
            return res.status(401).json({ code: "INVALID_PASSWORD" });
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
                return res.status(500).json({ code: "LOGOUT_FAILED" });
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
                    return res.status(500).json({ error: 'Account deleted, but logout failed' });
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
            return res.status(200).json({ isAuth: false });
        }

        try {
            const user = await this.userRepository.findUserById(userId);

            if (!user) {
                return res.status(200).json({ isAuth: false });
            }

            res.status(200).json({ isAuth: true, userId, name: user.name, email: user.email });
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}