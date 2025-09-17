
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { UserProfile, AdminProfile } from 'src/common/interfaces/authenticated-request';

describe('TokenService', () => {
    let service: TokenService;
    let jwtService: JwtService;

    beforeAll(() => {
        // Set test environment variable
        process.env.JWT_SECRET = 'test-jwt-secret-for-testing-32-chars-minimum';
    });

    afterAll(() => {
        // Clean up test environment variable
        delete process.env.JWT_SECRET;
    });

    const mockUserProfile: UserProfile = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
    };

    const mockAdminProfile: AdminProfile = {
        id: 1,
        email: 'admin@example.com',
        isAdmin: true
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateAccessToken', () => {
        it('should generate access token with correct payload', async () => {
            const expectedToken = 'mock.access.token';
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expectedToken);

            const token = await service.generateAccessToken(mockUserProfile);

            expect(token).toBe(expectedToken);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                {
                    sub: '1',
                    type: 'access',
                    profile: mockUserProfile
                },
                {
                    secret: 'test-jwt-secret-for-testing-32-chars-minimum',
                    expiresIn: '1h'
                }
            );
        });
    });

    describe('generateAdminToken', () => {
        it('should generate admin token with correct payload', async () => {
            const expectedToken = 'mock.admin.token';
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expectedToken);

            const token = await service.generateAdminToken(mockAdminProfile);

            expect(token).toBe(expectedToken);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                {
                    sub: '1',
                    type: 'admin',
                    profile: mockAdminProfile
                },
                {
                    secret: 'test-jwt-secret-for-testing-32-chars-minimum',
                    expiresIn: '4h'
                }
            );
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate refresh token for user', async () => {
            const expectedToken = 'mock.refresh.token';
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expectedToken);

            const token = await service.generateRefreshToken(mockUserProfile);

            expect(token).toBe(expectedToken);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                {
                    sub: '1',
                    type: 'refresh'
                },
                {
                    secret: 'test-jwt-secret-for-testing-32-chars-minimum',
                    expiresIn: '7d'
                }
            );
        });

        it('should generate refresh token for admin', async () => {
            const expectedToken = 'mock.admin.refresh.token';
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expectedToken);

            const token = await service.generateRefreshToken(mockAdminProfile);

            expect(token).toBe(expectedToken);
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                {
                    sub: '1',
                    type: 'admin'
                },
                {
                    secret: 'test-jwt-secret-for-testing-32-chars-minimum',
                    expiresIn: '7d'
                }
            );
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify valid access token', async () => {
            const mockPayload = {
                sub: '1',
                type: 'access' as const,
                profile: mockUserProfile
            };
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            const payload = await service.verifyAccessToken('valid.token');

            expect(payload).toEqual(mockPayload);
            expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token', {
                secret: 'test-jwt-secret-for-testing-32-chars-minimum'
            });
        });

        it('should throw error for invalid token type', async () => {
            const mockPayload = {
                sub: '1',
                type: 'refresh' as const,
                profile: mockUserProfile
            };
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            await expect(service.verifyAccessToken('invalid.token')).rejects.toThrow('Tipo de token inválido');
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify valid refresh token', async () => {
            const mockPayload = {
                sub: '1',
                type: 'refresh' as const
            };
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            const payload = await service.verifyRefreshToken('valid.refresh.token');

            expect(payload).toEqual(mockPayload);
        });

        it('should verify valid admin refresh token', async () => {
            const mockPayload = {
                sub: '1',
                type: 'admin' as const
            };
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            const payload = await service.verifyRefreshToken('valid.admin.refresh.token');

            expect(payload).toEqual(mockPayload);
        });

        it('should throw error for invalid refresh token type', async () => {
            const mockPayload = {
                sub: '1',
                type: 'access' as const
            };
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

            await expect(service.verifyRefreshToken('invalid.token')).rejects.toThrow('Tipo de token de renovación inválido');
        });
    });
});