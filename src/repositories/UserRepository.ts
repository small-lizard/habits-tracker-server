import bcrypt from 'bcryptjs';
import { IRepository } from '@repositories/IRepository.js';
import { User } from "@models/user.model.js";

export class UserRepository {
    private repository: IRepository<User>;

    constructor(repository: IRepository<User>) {
        this.repository = repository;
    }

    public async findUserById(id: string) {
        return await this.repository.find({id : id})
    }

    public async findUserByEmail(email: string) {
        return await this.repository.find({email: email})
    }

    public async addUser(userData: User) {
        const { password, ...rest } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            ...rest,
            password: hashedPassword,
        };

        return this.repository.save(newUser);
    }

    public async changePassword(id: string, newPassword: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await this.repository.update(id, { password: hashedPassword });

        return updatedUser;
    }

    public async updateUserData (id: string, isVerified: boolean) {
        const updatedUser = await this.repository.update(id, { isVerified: isVerified });

        return updatedUser;
    }

    async delete(userId: string) {
        return this.repository.delete(userId);
    }
}