# SafeTrade Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Enable accessible cybersecurity incident reporting for Spanish-speaking communities through friction-free mobile platform
- Transform individual cyber attack experiences into collective community intelligence and early warning system
- Achieve 1,000+ registered users within 6 months with 70% retention and 50+ weekly incident reports by month 3
- Establish active user communities in at least 3 Spanish-speaking regions within first year
- Maintain 85%+ report accuracy through community validation while supporting both anonymous and identified reporting
- Create "neighborhood watch" effect for cyber threats, improving community threat recognition by 60%+

### Background Context

SafeTrade addresses the critical gap in accessible cybersecurity incident reporting for Spanish-speaking communities who face increasing cyber threats but lack appropriate reporting mechanisms. Current enterprise-focused security tools require technical expertise and formal processes that exclude general consumers, particularly Spanish-speaking individuals who encounter phishing emails, malicious websites, and messaging scams with no effective way to warn their community.

The platform transforms fragmented, individual cyber attack experiences into collective intelligence through a community-driven mobile application. By providing both anonymous and identified reporting options with Spanish-native interface design, SafeTrade creates a transparent community database serving as an early warning system for emerging threats while respecting cultural communication preferences and privacy concerns.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-11 | 1.0 | Initial PRD creation from Project Brief | John (PM Agent) |

## Requirements

### Functional Requirements

**User Authentication & Registration**
- **FR1:** The system shall provide optional user registration and login via email and password authentication, with automatic session management via JWT tokens
- **FR1b:** The system shall support anonymous reporting without requiring user registration, allowing immediate incident reporting
- **FR2:** The system shall maintain user sessions via JWT tokens, eliminating need for repeated login while app is active

**Incident Reporting - Core Features**
- **FR3:** The system shall enable users to report cyber attacks through mobile device interface
- **FR4:** The system shall allow users to input date and time when the attack occurred
- **FR5:** The system shall provide attack type selection (email, SMS, WhatsApp, phone call, social media, other)
- **FR6:** The system shall enable users to register suspicious URLs with validation
- **FR7:** The system shall allow users to copy and paste original message text
- **FR8:** The system shall support screenshot and file attachment uploads related to the attack
- **FR9:** The system shall enable users to indicate impact suffered (none, data theft, money theft, compromised account)
- **FR10:** The system shall provide free-text description field for detailed attack information
- **FR11:** The system shall require users to register attack origin (phone number, email address)

**User Support & Features**
- **FR12:** The system shall provide personalized security recommendations after report submission
- **FR13:** The system shall automatically send help content to users who indicate they fell victim to a scam
- **FR14:** The system shall display community threat trends showing popular attack patterns
- **FR6 (Updated):** The system shall maintain user report history for registered/logged-in users only, while preserving complete anonymity for anonymous reporters
- **FR22:** The system shall allow registered users to choose between identified reports (linked to their account) or anonymous reports (not linked to their account) for each submission

**Admin Portal Features**
- **FR15:** The system shall provide secure admin login interface for SafeTrade company access
- **FR16:** The system shall display comprehensive list of all user-submitted reports
- **FR17:** The system shall provide search and filtering by date, attack type, contact method, impersonated entity, country/region, impact
- **FR18:** The system shall show complete report details with all associated user information
- **FR19:** The system shall highlight critical attacks based on highest impact levels
- **FR20:** The system shall allow admin to update report status (reviewed, under investigation, closed)
- **FR21:** The system shall enable admin to add notes to reports for investigation tracking

### Non-Functional Requirements

**NFR1:** The system shall maintain 99.5% uptime with response times under 2 seconds for critical reporting functions and under 5 seconds for data visualization
**NFR2:** The system shall support iOS 14+ devices with native Swift/SwiftUI implementation ensuring optimal mobile performance
**NFR3:** The system shall utilize self-hosted infrastructure with SQL Server database providing encrypted data storage and backup protocols
**NFR4:** The system shall implement JWT-based authentication system with secure session management and token validation
**NFR5:** The system shall scale to support 1,000+ registered users with 50+ weekly incident reports while maintaining performance standards
**NFR6:** The system shall ensure secure file upload handling with malware scanning and size limitations for user safety
**NFR7:** The system shall maintain data privacy compliance with secure handling of personal information and company data separation

## User Interface Design Goals

### Overall UX Vision

SafeTrade embodies the "neighborhood watch" digital experience—immediately familiar, trustworthy, and community-focused. The interface prioritizes speed and simplicity, enabling users to report incidents in three taps while feeling confident their community will see and benefit from their contribution. The design language balances transparency with privacy, using visual cues that communicate "shared safety" rather than "surveillance," with warm, approachable aesthetics that reduce anxiety while maintaining the seriousness of cybersecurity protection.

### Key Interaction Paradigms

**Friction-Free Reporting:** Primary interaction follows "tap-select-confirm" pattern where users choose incident type, provide minimal details through guided prompts, and submit with single confirmation. No multi-step wizards or complex form validation that could deter reporting during stressful post-incident moments.

**Community Feed Browsing:** Instagram-like scrollable feed with threat reports displayed as cards, enabling quick scanning for relevant threats. Each report shows incident type, community validation status, and relative timing without exposing personal information.

**Trust-Building Validation:** Users can validate reports through simple "helpful/not helpful" gestures, creating community credibility scores that appear as visual trust indicators rather than complex rating systems.

### Core Screens and Views

- **Quick Report Screen:** Primary entry point with three large, icon-based buttons for Website/Email/Messaging incident types
- **Community Feed Dashboard:** Real-time scrollable feed of community reports with filtering options and validation indicators  
- **Report Detail View:** Expanded view showing incident specifics, community validation status, and similar threat patterns
- **Personal History Screen:** (Identified users only) Track personal reports, validation feedback, and community impact metrics
- **Settings/Profile Screen:** Anonymous/identified account switching, notification preferences, and language/region settings

### Accessibility: WCAG AA

Full compliance with WCAG AA standards ensuring Spanish-speaking users with disabilities can effectively use all reporting and community features. High contrast color schemes, screen reader compatibility, and large touch targets particularly important for mobile-first platform serving diverse age demographics.

### Branding

Color scheme follows project specification: Primary #A1CDF4 (trust blue), Secondary #25283D (professional dark), Accent #F5853F (alert orange). Visual language emphasizes community protection and collective vigilance through shield iconography, connected network elements, and warm geometric patterns that suggest neighborhood solidarity rather than corporate security. Spanish cultural visual preferences integrated through typography choices and cultural color associations.

### Target Device and Platforms: Mobile-First iOS with Web Responsive

**Primary Platform:** Native iOS application optimized for iPhone and iPad, leveraging SwiftUI for fluid, native performance and iOS-specific interaction patterns (swipe gestures, haptic feedback, notification integration).

**Secondary Platform:** Web responsive portal for admin users preferring desktop/laptop access, maintaining consistent visual design and core functionality across browsers while adapting interface patterns for mouse/keyboard interaction.

## Technical Assumptions

### Repository Structure: Monorepo

**Rationale:** Single semester academic project with small development team benefits from unified codebase management. Monorepo approach enables shared configuration, documentation, and deployment scripts while maintaining clear separation between iOS app, backend API, and database schema components.

### Service Architecture

**Decision:** Monolithic backend API with microservice-ready modular design within Node.js NestJS framework.

**Rationale:** For MVP scope and academic timeline, monolithic approach provides development velocity and simplified deployment. However, internal module separation (authentication, reporting, analytics, community validation) prepares for future microservices migration as community scales beyond academic project scope.

### Testing Requirements

**Decision:** Unit testing + Integration testing with emphasis on API endpoint testing and core business logic validation.

**Rationale:** Academic timeline requires focused testing strategy. Unit tests for critical business logic (report validation, community scoring, JWT authentication) and integration tests for API endpoints ensure core functionality reliability. End-to-end testing deferred to post-MVP given development resource constraints.

### Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- **iOS Native:** Swift 5.5+ with SwiftUI for modern declarative UI development, targeting iOS 14+ for broad device compatibility
- **Web Portal:** React.js with TypeScript for type safety and developer productivity, responsive design using CSS Grid/Flexbox

**Backend Technology Stack:**
- **API Framework:** Node.js 18+ with Nest.js for rapid API development and extensive middleware ecosystem
- **Authentication:** JWT-based token system with bcrypt password hashing and refresh token rotation for security
- **Database ORM:** Sequelize for SQL Server integration with migration support and query optimization

**Database and Infrastructure:**
- **Database:** Self-hosted SQL Server 2019+ with encrypted storage at rest and automated backup procedures
- **Hosting:** Self-hosted on-premises or private cloud deployment for data sovereignty and cost control
- **SSL/TLS:** Let's Encrypt certificates for HTTPS everywhere with automatic renewal

**Development and Deployment:**
- **Version Control:** Git with feature branch workflow and code review requirements
- **CI/CD:** GitHub Actions or GitLab CI for automated testing and deployment pipelines
- **Environment Management:** Development, Staging, Production environment separation with configuration management
- **Monitoring:** Basic logging and error tracking (Winston for Node.js, native iOS crash reporting)

**Security Considerations:**
- **Data Encryption:** AES-256 encryption for sensitive data, bcrypt for password hashing, secure JWT implementation
- **Input Validation:** Comprehensive server-side validation for all API endpoints preventing SQL injection and XSS
- **Rate Limiting:** API rate limiting to prevent abuse and ensure service availability
- **CORS Configuration:** Restrictive CORS policy limiting frontend domain access

**Spanish Localization Requirements:**
- **Content Language:** All user interfaces, labels, messages, and content written directly in Spanish without internationalization frameworks
- **Implementation:** Hard-coded Spanish text in UI components and database content
- **No Special Tools:** Standard development without i18n libraries or translation management systems

## Epic List

Based on the SafeTrade requirements and following agile best practices, I present the high-level epic structure for user approval:

**Epic 1: Foundation & Core Infrastructure**
Establish project setup, authentication system, and basic reporting infrastructure while delivering initial threat reporting capability.

**Epic 2: Community Intelligence Engine** 
Create community feed, report validation system, and basic analytics to transform individual reports into collective threat intelligence.

**Epic 3: User Experience & Mobile Optimization**
Deliver native iOS application with optimized mobile reporting workflows and community engagement features.

**Epic 4: Data & Analytics Dashboard**
Provide community-level threat analytics and reporting insights to demonstrate platform value and inform community protection strategies.

### Rationale for Epic Structure

**Sequential Logic:** Each epic builds upon previous functionality while delivering tangible value:
- Epic 1 establishes core infrastructure and proves basic reporting works
- Epic 2 adds community intelligence layer that makes individual reports valuable to entire community  
- Epic 3 optimizes user experience for primary mobile audience
- Epic 4 provides analytical insights that demonstrate platform impact

**Value Delivery:** Each epic delivers deployable functionality:
- Epic 1: Users can report incidents and see basic confirmation
- Epic 2: Community can view, validate, and learn from collective reports
- Epic 3: Mobile users have optimal reporting and browsing experience
- Epic 4: Community gains insights into threat patterns and trends

**Epic Sizing:** Balanced approach with 4 substantial epics rather than many small ones, each delivering major functionality blocks that provide clear user/business value when deployed.

## Epic Details

### Epic 1: Foundation & Core Infrastructure

**Epic Goal:** Establish project infrastructure, user authentication system, and basic incident reporting capability while delivering initial threat reporting functionality that proves the core concept works.

This epic delivers the foundational elements needed for SafeTrade to function while providing immediate value through basic reporting capability. Users can register, authenticate, submit incident reports with essential details, and receive confirmation their reports are recorded in the system.

#### Story 1.1: Project Setup and Development Environment

As a developer,
I want to establish the complete development environment and project structure,
so that the team can efficiently develop both mobile and web applications with proper version control and deployment pipelines.

**Acceptance Criteria:**
1. iOS development environment configured with Xcode and Swift/SwiftUI project structure
2. Node.js backend API project initialized with NestJS framework and folder organization  
3. SQL Server database instance configured with connection testing and backup procedures
4. Git repository created with branching strategy and initial commit structure
5. Development, staging, and production environment configuration documented
6. Basic CI/CD pipeline established for automated testing and deployment

#### Story 1.2: User Authentication System

As a mobile user,
I want the option to register and login with persistent sessions,
so that I can track my reports over time while still having the choice to report anonymously.

**Acceptance Criteria:**
1. App opens with choice: "Reportar Anónimamente" or "Iniciar Sesión/Registrarse"
2. Anonymous users can report immediately without any registration
3. Registration creates account with email/password and generates JWT token
4. JWT tokens maintain session across app opens/closes
5. Logged-in users can choose "Reporte Identificado" or "Reporte Anónimo" for each submission
6. Token refresh system prevents forced re-login during active usage

#### Story 1.3: Anonymous and Identified Reporting

As a mobile user,
I want to report cyber attacks either anonymously or with my account,
so that I can choose my privacy level while contributing to community protection.

**Acceptance Criteria:**
1. Anonymous users access reporting form immediately from app home screen
2. Registered users see toggle: "Reporte Identificado" vs "Reporte Anónimo"
3. Anonymous reports save without user_id association
4. Identified reports link to user account for history tracking
5. Both report types contribute equally to community trends and analytics
6. No functionality differences between anonymous and identified reports

#### Story 1.4: Enhanced Reporting Data Collection

As a mobile user,
I want to provide detailed information about cyber attacks including URLs, message content, and screenshots,
so that my report contains comprehensive evidence for analysis and community protection.

**Acceptance Criteria:**
1. URL input field with validation for suspicious website reporting
2. Text area for copying and pasting original attack messages with character limit
3. Screenshot upload functionality with file size validation and secure storage
4. Impact assessment selection (ninguno, robo de datos, robo de dinero, cuenta comprometida)
5. File attachment support for additional evidence with secure handling
6. Form progress saving to prevent data loss during multi-step completion
7. All collected data properly structured and stored in database

### Epic 2: Community Intelligence Engine

**Epic Goal:** Transform individual incident reports into collective community threat intelligence by creating community feed functionality, automated user support features, and basic analytics that provide immediate value to the reporting community.

#### Story 2.1: Community Threat Trends Display

As a mobile user,
I want to see trends and patterns of popular attacks in my community,
so that I can stay informed about current threats and better protect myself.

**Acceptance Criteria:**
1. Trends screen showing most common attack types reported in last 30 days
2. Visual charts displaying attack frequency by type (email, SMS, WhatsApp, etc.)
3. Geographic trends showing attack patterns by region/area when available
4. Time-based trends showing increases/decreases in specific attack types
5. Simple filtering by time period (última semana, último mes, últimos 3 meses)
6. Data anonymization ensuring no personal information displayed in trends
7. Automatic trend calculation and updates based on new reports

#### Story 2.2: Personalized Security Recommendations

As a mobile user,
I want to receive personalized security recommendations after submitting a report,
so that I can better protect myself from similar attacks in the future.

**Acceptance Criteria:**
1. Recommendation engine providing specific advice based on attack type reported
2. Customized recommendations considering impact level suffered (data theft, money loss, etc.)
3. Actionable security tips delivered immediately after report submission
4. Recommendations database organized by attack type with Spanish content
5. Follow-up recommendations available in user profile/history section
6. Integration with report submission workflow for seamless user experience

#### Story 2.3: Automated Victim Support System

As a mobile user who fell victim to a scam,
I want to receive immediate help and support resources,
so that I can take appropriate actions to minimize damage and recover from the attack.

**Acceptance Criteria:**
1. Automatic detection when user indicates they fell victim during reporting
2. Immediate help content displayed with specific guidance based on attack type and impact
3. Support content customized for different scenarios (financial loss, data breach, etc.)
4. Resource information provided for reporting to authorities, banks, or relevant organizations
5. Recovery steps and prevention tips integrated into help content
6. Help content system integrated with report data for personalized support information

### Epic 3: User Experience & Mobile Optimization

**Epic Goal:** Deliver optimized native iOS application with streamlined mobile reporting workflows and enhanced user engagement features that maximize reporting adoption and community participation.

#### Story 3.1: Native iOS Interface Enhancement

As a mobile user,
I want a polished native iOS experience with intuitive navigation and performance,
so that reporting incidents feels fast, familiar, and trustworthy.

**Acceptance Criteria:**
1. Native iOS navigation patterns and UI components throughout app
2. SwiftUI implementation for smooth animations and iOS-native feel
3. Haptic feedback for form completion and important user actions
4. iOS accessibility compliance with VoiceOver and accessibility features
5. Performance optimization for smooth operation on older iPhone models
6. Spanish language interface throughout all mobile app elements

#### Story 3.2: Streamlined Reporting Workflow

As a mobile user,
I want to report incidents as quickly as possible with minimal steps,
so that I can easily report threats even when stressed or in a hurry after an attack.

**Acceptance Criteria:**
1. Quick report mode with essential fields only (3-tap reporting goal)
2. Smart defaults and pre-population of common fields (current date/time)
3. Progressive disclosure - show advanced fields only when needed
4. Draft saving functionality to prevent data loss if interrupted
5. One-handed operation optimization for mobile reporting scenarios
6. Clear visual feedback for all user actions and form completion

### Epic 4: Data & Analytics Dashboard

**Epic Goal:** Provide comprehensive threat analytics and administrative tools for report management, enabling SafeTrade administrators to identify threat patterns, manage report workflows, and demonstrate platform impact through data-driven insights.

#### Story 4.1: Admin Portal Foundation

As a SafeTrade administrator,
I want to securely access a web portal to manage incident reports,
so that I can monitor community-reported threats and maintain platform quality.

**Acceptance Criteria:**
1. Admin web portal login page with secure authentication
2. Admin dashboard with key metrics and report summary
3. Reports listing page displaying all user submissions with basic information
4. Report detail view showing complete submitted information
5. Spanish language interface for all admin portal elements
6. Responsive design for web browser access across devices

#### Story 4.2: Advanced Report Management

As a SafeTrade administrator,
I want comprehensive tools for searching, filtering, and managing incident reports,
so that I can efficiently identify critical threats and maintain accurate community intelligence.

**Acceptance Criteria:**
1. Search functionality across all report fields (text, dates, attack types, etc.)
2. Advanced filtering by multiple criteria simultaneously (date, type, impact, region)
3. Report status management with states (nuevo, revisado, en investigación, cerrado)
4. Critical attack highlighting based on impact level and pattern recognition
5. Bulk operations for updating multiple reports efficiently
6. Admin notes system for tracking investigation progress and decisions

#### Story 4.3: Analytics and Insights Dashboard

As a SafeTrade administrator,
I want comprehensive analytics about reported threats and platform usage,
so that I can identify patterns, trends, and areas requiring attention or improvement.

**Acceptance Criteria:**
1. Interactive dashboard with key performance indicators and threat metrics
2. Time-series analysis showing threat evolution over weeks/months
3. Attack vector analysis identifying most common and dangerous threat types
4. User engagement metrics tracking platform adoption and report quality
5. Geographic analysis showing threat distribution across regions
6. Exportable reports for sharing insights with stakeholders or authorities

## User Experience Requirements

### User Journeys & Primary Flows

**Mobile User Primary Flow:**
1. **Registration/Login Flow**
   - User downloads app → Opens app → Chooses "Registrarse" → Enters email/password → Email verification → Login success → Dashboard
   - Returning user: Opens app → Auto-login or enter credentials → Dashboard

2. **Anonymous Reporting Flow**
   - App Opens → "Reportar Anónimamente" → Report Form → Submit → Recommendations → View Trends

3. **Identified Reporting Flow**
   - Dashboard → "Reportar Ataque" → Choose "Reporte Identificado" → Fill incident details → Submit → Confirmation + Recommendations → Return to dashboard

4. **Community Trends Flow**
   - Dashboard → "Ver Tendencias" → View trend charts and popular attacks → Filter by time period → View specific threat details → Return to dashboard

**Admin Web Portal Primary Flow:**
1. **Admin Management Flow**
   - Login page → Enter admin credentials → Dashboard with report summary → View report list → Search/filter reports → Select report → View full details → Update status → Add notes → Save changes → Return to list

### Critical User Experience Requirements

**Mobile App Usability:**
- Maximum 3 taps to complete basic incident report
- Forms auto-save progress to prevent data loss
- Clear visual feedback for all user actions
- Spanish error messages with helpful guidance
- Support for both anonymous and identified user flows

**Admin Portal Usability:**
- Keyboard navigation support for efficient report processing
- Clear visual indicators for report status and priority
- Spanish interface throughout all admin functions
- Responsive design for various screen sizes

## Cross-Functional Data Requirements

### Data Entities and Relationships

**Core Database Schema:**

**Users Table (Optional):**
- user_id (Primary Key)
- email (Unique)
- password_hash
- jwt_token (current session)
- created_at
- updated_at

**Reports Table:**
- report_id (Primary Key)
- user_id (Foreign Key to Users, NULL for anonymous reports)
- is_anonymous (Boolean - true for anonymous, false for identified)
- attack_type (email, SMS, WhatsApp, llamada, redes_sociales, otro)
- incident_date
- incident_time
- attack_origin (phone/email of attacker)
- suspicious_url
- message_content (TEXT)
- impact_level (ninguno, robo_datos, robo_dinero, cuenta_comprometida)
- description (TEXT)
- status (nuevo, revisado, en_investigacion, cerrado)
- created_at
- updated_at

**Report_Attachments Table:**
- attachment_id (Primary Key)
- report_id (Foreign Key to Reports)
- file_name
- file_path
- uploaded_at

**Admin_Users Table:**
- admin_id (Primary Key)
- email (Unique)
- password_hash
- created_at
- last_login

### Data Storage Requirements
- Encrypted storage for sensitive user data
- Secure file storage for uploaded screenshots and attachments
- Regular automated backups with 30-day retention
- Data archiving strategy for reports older than 2 years

## Enhanced Acceptance Criteria & Testing

### Testing Strategy Requirements
- **Unit Testing:** All API endpoints and database operations
- **Integration Testing:** End-to-end user workflows for both mobile and web
- **Security Testing:** Authentication, data validation, file upload security
- **Performance Testing:** Response times under expected user load
- **Mobile Testing:** iOS device compatibility testing across iPhone models

### Error Handling Requirements
- Clear Spanish error messages for all validation failures
- Network interruption handling with retry options
- File upload error handling with helpful guidance
- Database connection error recovery
- Authentication token expiration handling

## Next Steps

### UX Expert Prompt

"Please create user interface designs and user experience flows for SafeTrade, a Spanish-language cybersecurity incident reporting platform. Use this PRD as your foundation to design:

**Mobile iOS App Requirements:**
1. **Triple User Flow Support:** Anonymous reporting, user registration/login with JWT sessions, and registered users choosing between identified/anonymous reports
2. **Three-Tap Reporting Goal:** Streamlined incident reporting form with attack type selection, essential details, and optional screenshot uploads
3. **Community Trends Dashboard:** Visual charts showing popular attack patterns and threat trends
4. **Spanish Interface:** All content, labels, buttons, and messages in Spanish
5. **Color Scheme:** Primary #A1CDF4 (trust blue), Secondary #25283D (professional dark), Accent #F5853F (alert orange)

**Admin Web Portal Requirements:**
1. **Report Management Interface:** List view with search/filter capabilities, detailed report views, status updates
2. **Spanish Localization:** Complete Spanish interface for all administrative functions
3. **Critical Attack Highlighting:** Visual indicators for high-impact reports requiring priority attention

Focus on community trust-building visual design that encourages reporting while respecting user privacy choices."

### Architect Prompt

"Please create the technical architecture for SafeTrade based on this PRD. Design the system architecture for:

**System Components:**
1. **iOS Mobile App** (Swift/SwiftUI) - Native iOS with anonymous + registered user flows
2. **Node.js Backend API** (NestJS framework) - RESTful API with JWT authentication
3. **SQL Server Database** (self-hosted) - User accounts, reports, and attachments
4. **Web Admin Portal** (React.js) - Administrative interface for report management

**Key Architecture Requirements:**
- **Triple Authentication Model:** Anonymous users, JWT-based registered users, admin users
- **Flexible Reporting System:** Support both anonymous and identified reports from same users
- **Database Schema:** Users (optional), Reports (with nullable user_id), Report_Attachments, Admin_Users
- **File Upload System:** Secure screenshot/attachment handling with server storage
- **Scalability Target:** 1,000+ users, 50+ weekly reports, 99.5% uptime, <2s response times

**Security Considerations:**
- JWT token management and refresh
- Anonymous report privacy protection
- Secure file upload validation
- Admin role separation
- Self-hosted deployment architecture

Design the API endpoints, database relationships, authentication flows, and deployment architecture to fulfill all functional requirements (FR1-FR22)."