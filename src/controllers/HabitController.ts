import { Request, Response } from "express";
import { HabitRepository } from "@repositories/HabitRepository.js";
import { Session } from "express-session";

type SessionRequest = Request & {
    session: Session & { userId?: string };
};

export class HabitController {
    private habitRepository: HabitRepository;

    constructor({ habitRepository }: { habitRepository: HabitRepository }) {
        this.habitRepository = habitRepository;
    }

    public addHabit = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId as string;

        try {
            const habit = await this.habitRepository.addHabit({
                ...req.body,
                userId
            });

            res.status(201).json(habit);

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public updateHabit = async (req: Request, res: Response) => {
        try {
            const habit = await this.habitRepository.updateHabit(req.body);

            res.status(200).json(habit);

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const habit = await this.habitRepository.delete(req.params.id);

            res.status(200).json(habit);

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public getHabits = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId as string;

        try {
            const habits = await this.habitRepository.getByUser(userId);

            res.status(200).json(habits);

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

