import bcrypt from 'bcryptjs';
import { IRepository } from './IRepository';
import HttpError from '../utils/HttpError';

export type User = {
    _id?: string,
    email: string,
    name: string,
    password: string,
}

class UserRepository {

    private database: IRepository<User>;

    constructor(database: IRepository<User>) {
        this.database = database;
    }

    async addUser(userData: User) {
        const { email, password, ...rest } = userData;
        const existingUser = await this.database.find({ email: email.toLowerCase() });
        if (existingUser) {
            throw new HttpError(400, 'A user with this email already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            email: email.toLowerCase(),
            password: hashedPassword,
            ...rest,
        };

        return this.database.save(newUser);
    }

    async login(userData: User) {
        const user = await this.database.find({ email: userData.email.toLowerCase() });
        if (!user) throw new HttpError(401, 'Incorrect email.');

        const passwordCompare = await bcrypt.compare(userData.password, user.password);
        if (!passwordCompare) throw new HttpError(401, 'Incorrect password.');

        return user;
    }

    async changePassword(id: string, password: string ) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await this.database.update(id, { password: hashedPassword });
        if (!updatedUser) throw new HttpError(404, 'User not found.');

        return updatedUser;
    }

    async delete(id: string ) {
        if (!id) throw new HttpError(401, 'User id is required');
        return this.database.delete(id);
    }
}

export default UserRepository;