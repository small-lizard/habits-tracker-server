import { Request, Response } from "express";
import HabitRepository from "../repositories/HabitRepository";
import { Session } from "express-session";

interface SessionRequest extends Request {
    session: Session & { userId?: string };
}

class HabitController {
    private habitRepository: HabitRepository;

    constructor({ habitRepository }: { habitRepository: HabitRepository }) {
        this.habitRepository = habitRepository;
    }

    addHabit = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            const habit = await this.habitRepository.addHabit({ ...req.body, userId });
            res.status(200).json(habit);
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    updateHabit = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Not logged in' });
            }
            const habit = await this.habitRepository.updateHabit(req.body);
            res.status(200).json(habit);
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    getHabits = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            if (!userId) throw new Error()
            const habits = await this.habitRepository.getByUser(userId);
            res.status(200).json(habits);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    sync = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;

            if (req.body.habits?.length) {
                await Promise.all(req.body.habits.map((habit: any) =>
                    this.habitRepository.addHabit({ ...habit, userId })
                ));
            }

            res.status(200).json(userId);
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const userId = (req as SessionRequest).session.userId;
            if (!userId) return res.status(401).json({ message: 'Not logged in' });

            const habit = await this.habitRepository.delete(req.params._id);
            res.status(200).json(habit);
        } catch (error) {
            console.error(error);
            const err = error as Error & { status?: number };
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

export default HabitController;

