import bcrypt from 'bcryptjs';
import { IRepository } from '../repositories/IRepository';
import { User } from "../models/user.model";
import mongoose from 'mongoose';

export class UserRepository {
    private repository: IRepository<User>;

    constructor(repository: IRepository<User>) {
        this.repository = repository;
    }

    public async findUserById(id: any) {
       return await this.repository.findById(id);
    }

    public async findUserByEmail(email: string) {
        return await this.repository.find({ email: email })
    }

    public async addUser(userData: Omit<User, 'id'>) {
        const { password, ...rest } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password!, salt);

        return this.repository.save({
            ...rest,
            password: hashedPassword,
        });
    }

    public async changePassword(id: string, newPassword: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await this.repository.update(id, { password: hashedPassword });

        return updatedUser;
    }

    public async updateUserData(id: string, data: Partial<User>) {
        const updatedUser = await this.repository.update(id, data);

        return updatedUser;
    }

    async delete(userId: string) {
        
        return this.repository.delete(userId);
    }

    public async findByGoogleId(googleId: any) {

        return await this.repository.find({ googleId: googleId })
    }

    public async attachGoogleId(userId: any, googleId: any) {
        const updatedUser = await this.repository.update(userId, { googleId: googleId });

        return updatedUser;
    }

    public async createOAuthUser(data: { name: string; email: string; googleId: string }) {

        return this.repository.save({
            name: data.name,
            email: data.email,
            googleId: data.googleId,
            password: null,
            isVerified: true,
            blockedUntil: null,
        });
    }
}