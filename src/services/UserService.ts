import { UserRepository } from "../repositories/UserRepository";
import { OAuth2Client } from 'google-auth-library';

type UserServiceDeps = {
    userRepository: UserRepository;
};

export class UserService {
    private userRepository: UserRepository;
    private googleClient: OAuth2Client;

    constructor({ userRepository }: UserServiceDeps) {
        this.userRepository = userRepository;
        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    public async handleGoogleCallback(code: any) {
        const { tokens } = await this.googleClient.getToken({
            code,
            redirect_uri: 'postmessage'
        });
        this.googleClient.setCredentials(tokens);

        const response = await this.googleClient.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        });

        const user = response.data as {
            id: string;
            email: string;
            name: string;
        };

        const isUserEmailExist = await this.userRepository.findUserByEmail(user.email.toLowerCase());
        const isUserGoogleIdExist = await this.userRepository.findByGoogleId(user.id);
        if (isUserGoogleIdExist) {
            return isUserGoogleIdExist;
        }

        if (isUserEmailExist && !isUserGoogleIdExist) {
            return await this.userRepository.attachGoogleId(isUserEmailExist.id, user.id);
        }

        return await this.userRepository.createOAuthUser({
            name: user.name,
            email: user.email,
            googleId: user.id,
        });
    }
};