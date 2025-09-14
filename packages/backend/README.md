# SafeTrade Backend API

NestJS backend application for the SafeTrade cybersecurity reporting platform.

## Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Configure the database connection in `.env`:
   - Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
   - Generate JWT secrets using crypto.randomBytes()

3. Install dependencies:
```bash
npm install
```

4. Run database migrations (once implemented):
```bash
npm run migration:run
```

5. Start the development server:
```bash
npm run start:dev
```

## Environment Variables Required

The following environment variables must be configured in `.env`:

- **DB_HOST**: MySQL host (default: localhost)
- **DB_PORT**: MySQL port (default: 3306)
- **DB_NAME**: Database name (safetrade_dev)
- **DB_USER**: MySQL username (default: root)
- **DB_PASSWORD**: MySQL password
- **JWT_SECRET**: Random secret for JWT tokens
- **JWT_REFRESH_SECRET**: Random secret for refresh tokens

## Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## Architecture

The application follows NestJS modular architecture:

- `auth/` - Authentication and authorization
- `reporting/` - Report management (Spanish endpoints: /reportes)
- `community/` - Community features (Spanish endpoints: /tendencias-comunidad)  
- `admin/` - Administrative functions
- `shared/` - Shared utilities, configurations, and database setup