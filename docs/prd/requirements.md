# Requirements

## Functional Requirements

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

## Non-Functional Requirements

**NFR1:** The system shall maintain 99.5% uptime with response times under 2 seconds for critical reporting functions and under 5 seconds for data visualization
**NFR2:** The system shall support iOS 14+ devices with native Swift/SwiftUI implementation ensuring optimal mobile performance
**NFR3:** The system shall utilize self-hosted infrastructure with MySQL database providing encrypted data storage and backup protocols
**NFR4:** The system shall implement JWT-based authentication system with secure session management and token validation
**NFR5:** The system shall scale to support 1,000+ registered users with 50+ weekly incident reports while maintaining performance standards
**NFR6:** The system shall ensure secure file upload handling with malware scanning and size limitations for user safety
**NFR7:** The system shall maintain data privacy compliance with secure handling of personal information and company data separation
