/* eslint-disable prettier/prettier */

import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Generate a unique cryptographic salt for password hashing
 * @returns {string} Hex-encoded salt
 */
export const generateSalt = (): string => {
    return randomBytes(32).toString('hex');
};

/**
 * Hash password using bcrypt with unique salt
 * @param {string} password - Plain text password
 * @param {string} salt - Unique salt for this user
 * @returns {Promise<string>} Bcrypt hash
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
    const saltRounds = 12; // >= 12 as required by coding standards
    const saltedPassword = password + salt;
    return bcrypt.hash(saltedPassword, saltRounds);
};

/**
 * Verify password against stored hash
 * @param {string} password - Plain text password
 * @param {string} salt - User's unique salt
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
    const saltedPassword = password + salt;
    return bcrypt.compare(saltedPassword, hash);
};