
import { Injectable } from "@nestjs/common";
import { UsersRepository, User } from "./users.repository";
import { generateSalt, hashPassword, verifyPassword } from "src/util/hash/hash.util";

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(email: string, name: string, password: string): Promise<User | null> {
        // Generate unique salt for this user
        const salt = generateSalt();
        const hashed_password = await hashPassword(password, salt);

        return this.usersRepository.createUser(email, name, hashed_password, salt);
    }

    async findById(id: number): Promise<User | null> {
        return this.usersRepository.findById(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findByEmail(email);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.findAll();
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            return null;
        }

        const isValid = await verifyPassword(password, user.salt, user.password_hash);
        return isValid ? user : null;
    }

    async updateUser(id: number, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<User | null> {
        return this.usersRepository.updateUser(id, updates);
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.usersRepository.deleteUser(id);
    }

    async updateLastLogin(id: number): Promise<void> {
        return this.usersRepository.updateLastLogin(id);
    }
}