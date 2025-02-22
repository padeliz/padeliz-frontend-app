# Padel Events App - Feature Specification & API Flow

## Overview

The Padel Events App enables users to:
- Sign in using Google authentication
- View past and upcoming padel events
- Apply for eligibility before joining an event
- Pay via bank transfer or Netopia Payments
- Track event registration status and past participation

## Dev Infrastructure

- Windows 11
- Docker

Make sure that during development:
- for calling the app backend API, let me switch between:
    - communicating with the backend container (for calling the API endpoints);
    - a fake backend service with mock data;
- you can access the Netopia sandbox API;
- I can test the app locally for both mobile and web;
- the app will be able to run on a real device as well as a simulator;

## Tech Stack:

- Frontend: React Native with TypeScript, Expo, and Expo Router
- Backend/Database: fake API and also another container with Symfony/Laravel
- UI Framework: React Native Paper
- Login: Google OAuth
- Payment Processing: Netopia (prepare anything for their sandbox API as well as the real one)
- API: REST

### Authentication
- Google OAuth Sign-in only (no password management needed)
- **API:** `POST /api/auth/google`

### Welcome Screen
- nice padel mascot icon
- Google login integration

### Main Page Navigation

The app features three main tabs:

1. **Previous Events**
   - List of past events
   - **API:** `GET /api/editions?status=past`

2. **Upcoming Events** (Default View)
   - List of future events
   - **API:** `GET /api/editions?status=upcoming`

3. **My Events**
   - Combined view of user's past & upcoming events
   - Becomes default if user has joined an upcoming event
   - **API:** `GET /api/user/editions`

#### Event Details

Each event shows:
- Photo
- Location
- Date
- Extended details on click:
  - Hours Interval
  - Organizer
  - Price per player
  - Registration deadline
- **API:** `GET /api/editions/{edition_id}`

### Event Registration Flow

#### 1. Eligibility Check
First-time participants must complete validation:

1. **Discovery Source**
   - Online (Instagram, TikTok, Facebook, Pinterest, Reddit, LinkedIn, etc.)
   - Friends (up to 3 referrals)

2. **Sports Background**
   - Experience in: Padel, Tennis, Ping-Pong, Squash
   - Frequency and recency

3. **Personal Details**
   - Full name (middle name optional)
   - Age verification
   - Student status (if ≤26)
     - Student ID verification required

4. **Profile Photo**
   - Multiple upload options
   - Used for team formation
   - Subject to manual review
   - Multiple photos can be submitted to increase approval chances

**APIs:**
- Submit: `POST /api/players/eligibility`
- Check Status: `GET /api/players/eligibility/status`
- Submit Photos: `POST /api/players/profile/photos`
- Check Photo Review Status: `GET /api/players/profile/photos/status`

#### 2. Payment Processing
Two payment methods available:

1. **Bank Transfer**
   - Account details provided
   - Manual payment proof upload
   - **API:** `POST /api/participations/{participation_id}/bank-transfer`

2. **Netopia Payments**
   - Direct payment gateway
   - **API:** `POST /api/participations/{participation_id}/netopia`

Status Check: `GET /api/participations/{participation_id}/payment/status`

### User Profile

Profile dashboard displays:
- Personal information
- Connected Google accounts
  - Primary account (used for sign-in)
  - Option to link additional Google accounts as secondary
- Profile picture
   - If you update it, they must approved firstly
   - Multiple photos can be submitted to increase approval chances
   - Current photo remains active until a new one is approved
- Event history
- Referral network

**APIs:**
- Profile Data: `GET /api/players/profile`
- Submit Photos: `POST /api/players/profile/photos`
- Referrals: `GET /api/players/recommendations`
- Link Google Account: `POST /api/players/profile/google-accounts`
- Unlink Secondary Account: `DELETE /api/players/profile/google-accounts/{account_id}`

## Technical Specifications

### API Endpoint Summary

| Action | Method | Endpoint |
|--------|--------|----------|
| **Authentication** |
| Google Sign In | `POST` | `/api/auth/google` |
| **Events & Editions** |
| List Past/Upcoming Events | `GET` | `/api/editions?status={past/upcoming}` |
| List User Events | `GET` | `/api/user/editions` |
| Get Event Details | `GET` | `/api/editions/{edition_id}` |
| **Eligibility & Profile** |
| Submit Eligibility Form | `POST` | `/api/players/eligibility` |
| Check Eligibility Status | `GET` | `/api/players/eligibility/status` |
| Get User Profile | `GET` | `/api/players/profile` |
| Submit Profile Photos | `POST` | `/api/players/profile/photos` |
| List User Referrals | `GET` | `/api/players/recommendations` |
| **Payments** |
| Submit Bank Transfer | `POST` | `/api/participations/{participation_id}/bank-transfer` |
| Process Netopia Payment | `POST` | `/api/participations/{participation_id}/netopia` |
| Check Payment Status | `GET` | `/api/participations/{participation_id}/payment/status` |
| **Clubs & Locations** |
| List Clubs | `GET` | `/api/clubs` |
| Get Club Details | `GET` | `/api/clubs/{club_id}` |
| List Club Locations | `GET` | `/api/clubs/{club_id}/locations` |
| **Divisions** |
| List Divisions | `GET` | `/api/divisions` |
| Get Division Details | `GET` | `/api/divisions/{division_id}` |
| List Edition Divisions | `GET` | `/api/editions/{edition_id}/divisions` |
| **Participations** |
| Register for Edition | `POST` | `/api/editions/{edition_id}/participations` |
| Update Participation | `PUT` | `/api/participations/{participation_id}` |
| Cancel Participation | `DELETE` | `/api/participations/{participation_id}` |
| **Prizes & Lotteries** |
| List Prizes | `GET` | `/api/prizes` |
| List Club Prizes | `GET` | `/api/clubs/{club_id}/prizes` |
| List Edition Lotteries | `GET` | `/api/editions/{edition_id}/lotteries` |

## Project Structure

```
padel-events-app/
├── src/
│   ├── app/                     # Expo Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login.tsx
│   │   │   └── welcome.tsx
│   │   ├── (tabs)/             # Main tab navigation
│   │   │   ├── previous-events/
│   │   │   ├── upcoming-events/
│   │   │   └── my-events/
│   │   ├── (modals)/           # Modal screens
│   │   │   ├── editions.tsx
│   │   │   └── profile-edit.tsx
│   │   └── _layout.tsx         # Root layout
│   ├── components/
│   │   ├── common/             # Shared UI components
│   │   │   ├── buttons/
│   │   │   ├── cards/
│   │   │   ├── inputs/
│   │   │   └── layout/
│   │   ├── events/             # Event-related components
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   └── filters/
│   │   ├── profile/            # Profile-related components
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── PhotoUpload.tsx
│   │   │   └── AccountLinks.tsx
│   │   ├── eligibility/        # Eligibility-related components
│   │   │   ├── forms/
│   │   │   └── validation/
│   │   └── payment/            # Payment-related components
│   │       ├── BankTransfer.tsx
│   │       └── NetopiaPayment.tsx
│   ├── services/
│   │   ├── api/                # API client and endpoints
│   │   │   ├── client.ts
│   │   │   ├── endpoints/
│   │   │   └── mock/          # Mock API responses
│   │   ├── auth/               # Authentication service
│   │   │   ├── google.ts
│   │   │   └── session.ts
│   │   └── payment/            # Payment integration
│   │       ├── netopia.ts
│   │       └── bank-transfer.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── api/                # API-related hooks
│   │   ├── auth/               # Authentication hooks
│   │   └── forms/              # Form-related hooks
│   ├── context/                # Global state management
│   │   ├── auth/
│   │   ├── events/
│   │   └── profile/
│   ├── types/                  # TypeScript definitions
│   │   ├── api/
│   │   ├── models/
│   │   └── forms/
│   ├── utils/                  # Helper functions
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── storage.ts
│   ├── constants/              # App constants
│   │   ├── api.ts
│   │   ├── config.ts
│   │   └── navigation.ts
│   └── theme/                  # UI theming
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── assets/
│   ├── images/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── backgrounds/
│   └── fonts/
├── docs/                       # Documentation
│   ├── CONTEXT.md
│   ├── API.md
│   └── SETUP.md
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── app.config.ts              # Expo configuration
├── babel.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### Key Directory Explanations

- **app/**: Expo Router pages organized by authentication, tabs, and modals
  - **(auth)/**: Authentication-related screens
  - **(tabs)/**: Main navigation tabs screens
  - **(modals)/**: Modal screens like event details

- **components/**: UI components organized by feature and responsibility
  - **common/**: Reusable UI elements (buttons, cards, inputs)
  - **events/**: Event-specific components
  - **profile/**: Profile-related components
  - **eligibility/**: Eligibility check components
  - **payment/**: Payment processing components

- **services/**: External integrations and API communication
  - **api/**: API client, endpoints, and mock data
  - **auth/**: Authentication services
  - **payment/**: Payment gateway integrations

- **hooks/**: Custom React hooks organized by feature
  - **api/**: Data fetching and mutation hooks
  - **auth/**: Authentication-related hooks
  - **forms/**: Form handling hooks

- **context/**: Global state management
  - **auth/**: Authentication state
  - **events/**: Events-related state
  - **profile/**: User profile state

- **types/**: TypeScript type definitions
  - **api/**: API response and request types
  - **models/**: Domain model types
  - **forms/**: Form-related types

- **utils/**: Helper functions for common operations
  - **date.ts**: Date manipulation utilities
  - **validation.ts**: Form validation helpers
  - **formatting.ts**: Data formatting utilities
  - **storage.ts**: Local storage helpers

- **constants/**: Application-wide constants
  - **api.ts**: API endpoints and configs
  - **config.ts**: App configuration
  - **navigation.ts**: Navigation constants

- **theme/**: UI theming configuration
  - **colors.ts**: Color palette
  - **typography.ts**: Font styles
  - **spacing.ts**: Layout spacing

- **assets/**: Static assets organized by type
  - **images/**: Image assets (logos, icons, backgrounds)
  - **fonts/**: Custom fonts

- **tests/**: Test files organized by type
  - **unit/**: Unit tests
  - **integration/**: Integration tests
  - **e2e/**: End-to-end tests
