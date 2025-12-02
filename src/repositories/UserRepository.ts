import bcrypt from 'bcryptjs';
import { IRepository } from './IRepository';
import { User } from "../models/user.model";

class UserRepository {
    private repository: IRepository<User>;

    constructor(repository: IRepository<User>) {
        this.repository = repository;
    }

    public async findUser(id: string) {
        return await this.repository.find({ id: id })
    }

    public async addUser(userData: User) {
        const { password, ...rest } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            password: hashedPassword,
            ...rest,
        };

        return this.repository.save(newUser);
    }

    public async changePassword(id: string, newPassword: string ) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await this.repository.update(id, { password: hashedPassword });

        return updatedUser;
    }

    async delete(userId: string) {
        return this.repository.delete(userId);
    }
}

export default UserRepository;