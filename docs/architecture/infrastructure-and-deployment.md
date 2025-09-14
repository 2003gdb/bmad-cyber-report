# Infrastructure and Deployment

## Infrastructure as Code
- **Tool:** Docker Compose 2.21.0 (for local development containerization)
- **Location:** `docker/docker-compose.yml` (in project root)
- **Approach:** Local containerization for consistent development environments across team members

## Deployment Strategy
- **Strategy:** Local Development with Docker Compose
- **Primary Environment:** Individual developer machines with shared database container
- **Presentation Deployment:** Simple production build for final academic presentation
- **Pipeline Configuration:** Manual build processes documented in `scripts/` directory

## Environments

- **Development:** Local machine with Docker containers - Individual developer environments with shared MySQL container and local file storage
- **Testing:** Local testing environment - Same as development but with test database and mock external services  
- **Demo:** Academic presentation environment - Production builds running locally for demonstration and evaluation purposes

## Environment Promotion Flow

```
Individual Development
    ↓ (manual testing)
Local Testing Environment
    ↓ (team integration)
Team Integration Testing
    ↓ (academic milestone)
Demo/Presentation Build
```

## Rollback Strategy
- **Primary Method:** Git version control with tagged releases
- **Trigger Conditions:** Failed integration testing, breaking changes, database corruption
- **Recovery Time Objective:** 15 minutes (restore from git tag + rebuild containers)
