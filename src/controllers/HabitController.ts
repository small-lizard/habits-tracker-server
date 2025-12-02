import { Request, Response } from "express";
import HabitRepository from "../repositories/HabitRepository";
import { Session } from "express-session";
import { Habit } from "../models/habit.model";

type SessionRequest = Request & {
    session: Session & { userId?: string };
};

class HabitController {
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

    public sync = async (req: Request, res: Response) => {
        const userId = (req as SessionRequest).session.userId as string;
        const habits = req.body.habits;
        
        if (!habits || habits.length === 0) {
            return res.status(400).json({ error: 'No habits provided' });
        }

        try {
            await Promise.all(
                habits.map((habit: Habit) => this.habitRepository.addHabit({ ...habit, userId }))
            );

            res.status(200).json({ userId });

        } catch (error) {

            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default HabitController;

