
import { generateSalt, hashPassword, verifyPassword } from './hash.util';

describe('Hash Utilities', () => {
    describe('generateSalt', () => {
        it('should generate a unique salt', () => {
            const salt1 = generateSalt();
            const salt2 = generateSalt();

            expect(salt1).toBeDefined();
            expect(salt2).toBeDefined();
            expect(salt1).not.toBe(salt2);
            expect(salt1.length).toBe(64); // 32 bytes * 2 (hex encoding)
        });

        it('should generate cryptographically random salts', () => {
            const salts = new Set();

            // Generate 100 salts and ensure they're all unique
            for (let i = 0; i < 100; i++) {
                const salt = generateSalt();
                expect(salts.has(salt)).toBe(false);
                salts.add(salt);
            }
        });
    });

    describe('hashPassword', () => {
        it('should hash password with salt using bcrypt', async () => {
            const password = 'testPassword123';
            const salt = generateSalt();

            const hash = await hashPassword(password, salt);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash).not.toBe(salt);
            expect(hash.startsWith('$2b$')).toBe(true); // bcrypt hash format
        });

        it('should generate different hashes for same password with different salts', async () => {
            const password = 'testPassword123';
            const salt1 = generateSalt();
            const salt2 = generateSalt();

            const hash1 = await hashPassword(password, salt1);
            const hash2 = await hashPassword(password, salt2);

            expect(hash1).not.toBe(hash2);
        });

        it('should generate different hashes for different passwords with same salt', async () => {
            const salt = generateSalt();
            const password1 = 'testPassword123';
            const password2 = 'differentPassword456';

            const hash1 = await hashPassword(password1, salt);
            const hash2 = await hashPassword(password2, salt);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('should verify correct password with matching salt and hash', async () => {
            const password = 'testPassword123';
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);

            const isValid = await verifyPassword(password, salt, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword456';
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);

            const isValid = await verifyPassword(wrongPassword, salt, hash);

            expect(isValid).toBe(false);
        });

        it('should reject correct password with wrong salt', async () => {
            const password = 'testPassword123';
            const salt1 = generateSalt();
            const salt2 = generateSalt();
            const hash = await hashPassword(password, salt1);

            const isValid = await verifyPassword(password, salt2, hash);

            expect(isValid).toBe(false);
        });

        it('should reject with invalid hash format', async () => {
            const password = 'testPassword123';
            const salt = generateSalt();
            const invalidHash = 'not-a-valid-hash';

            const isValid = await verifyPassword(password, salt, invalidHash);

            expect(isValid).toBe(false);
        });
    });
});