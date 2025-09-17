# Epic Details

## Epic 1: Foundation & Core Infrastructure

**Epic Goal:** Establish project infrastructure, user authentication system, and basic incident reporting capability while delivering initial threat reporting functionality that proves the core concept works.

This epic delivers the foundational elements needed for SafeTrade to function while providing immediate value through basic reporting capability. Users can register, authenticate, submit incident reports with essential details, and receive confirmation their reports are recorded in the system.

### Story 1.1: Project Setup and Development Environment

As a developer,
I want to establish the complete development environment and project structure,
so that the team can efficiently develop both mobile and web applications with proper version control and deployment pipelines.

**Acceptance Criteria:**
1. iOS development environment configured with Xcode and Swift/SwiftUI project structure
2. Node.js backend API project initialized with NestJS framework and folder organization  
3. MySQL database instance configured with connection testing and backup procedures
4. Git repository created with branching strategy and initial commit structure
5. Development, staging, and production environment configuration documented

### Story 1.2: User Authentication System

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

### Story 1.3: Anonymous and Identified Reporting

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

### Story 1.4: Enhanced Reporting Data Collection

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

## Epic 2: Community Intelligence Engine

**Epic Goal:** Transform individual incident reports into collective community threat intelligence by creating community feed functionality, automated user support features, and basic analytics that provide immediate value to the reporting community.

### Story 2.1: Community Threat Trends Display

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

### Story 2.2: Personalized Security Recommendations

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

### Story 2.3: Automated Victim Support System

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

## Epic 3: User Experience & Mobile Optimization

**Epic Goal:** Deliver optimized native iOS application with streamlined mobile reporting workflows and enhanced user engagement features that maximize reporting adoption and community participation.

### Story 3.1: Native iOS Interface Enhancement

As a mobile user,
I want a polished native iOS experience with intuitive navigation and performance,
so that reporting incidents feels fast, familiar, and trustworthy.

**Acceptance Criteria:**
1. Native iOS navigation patterns and UI components throughout app
2. SwiftUI implementation for smooth animations and iOS-native feel
3. Haptic feedback for form completion and important user actions
4. Spanish language interface throughout all mobile app elements

### Story 3.2: Streamlined Reporting Workflow

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

## Epic 4: Data & Analytics Dashboard

**Epic Goal:** Provide comprehensive threat analytics and administrative tools for report management, enabling SafeTrade administrators to identify threat patterns, manage report workflows, and demonstrate platform impact through data-driven insights.

### Story 4.1: Admin Portal Foundation

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

### Story 4.2: Advanced Report Management

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

### Story 4.3: Analytics and Insights Dashboard

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
