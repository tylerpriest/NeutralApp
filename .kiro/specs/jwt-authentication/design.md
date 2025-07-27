# JWT Authentication Design

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   JWT Service   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ AuthContext │ │◄──►│ │ Auth Routes │ │◄──►│ │ JWT Utils   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ AuthGuard   │ │    │ │ Middleware  │ │    │ │ Token Store │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Backend Components
1. **JWT Authentication Service** (`src/features/auth/services/jwt.service.ts`)
   - Token generation and validation
   - User authentication logic
   - Token refresh handling

2. **Authentication Middleware** (`src/features/auth/middleware/auth.middleware.ts`)
   - JWT token validation
   - Route protection
   - User context injection

3. **Authentication Routes** (`src/features/auth/routes/auth.routes.ts`)
   - Login endpoint (`POST /api/auth/signin`)
   - Session validation endpoint (`GET /api/auth/session`)
   - Logout endpoint (`POST /api/auth/signout`)

#### Frontend Components
1. **JWT Auth Context** (`src/web/client/contexts/JWTAuthContext.tsx`)
   - JWT token management
   - Authentication state
   - API request authentication

2. **JWT Auth Guard** (`src/web/client/components/JWTAuthGuard.tsx`)
   - Route protection based on JWT state
   - Redirect logic for unauthenticated users

3. **JWT Auth Page** (`src/web/client/pages/JWTAuthPage.tsx`)
   - Login form
   - Registration form (if needed)
   - Error handling and user feedback

### Data Flow

#### Authentication Flow
1. User submits credentials via login form
2. Frontend sends POST request to `/api/auth/signin`
3. Backend validates credentials and generates JWT token
4. Backend returns JWT token to frontend
5. Frontend stores token in localStorage
6. Frontend updates AuthContext state
7. User is redirected to protected route

#### Session Validation Flow
1. User accesses protected route
2. AuthGuard checks for JWT token in localStorage
3. If token exists, frontend validates with `/api/auth/session`
4. Backend validates JWT token and returns user info
5. Frontend updates AuthContext with user data
6. User can access protected route

#### Logout Flow
1. User clicks logout
2. Frontend sends POST request to `/api/auth/signout`
3. Backend invalidates token (optional - JWT is stateless)
4. Frontend removes token from localStorage
5. Frontend clears AuthContext state
6. User is redirected to login page

### Technology Stack

#### Backend
- **Express.js**: Web server and routing
- **jsonwebtoken**: JWT token generation and validation
- **bcryptjs**: Password hashing (if needed)
- **cors**: Cross-origin resource sharing

#### Frontend
- **React Context**: State management
- **localStorage**: Token persistence
- **fetch API**: HTTP requests
- **React Router**: Navigation and route protection

### Security Considerations

#### JWT Token Security
- Tokens expire after 30 days
- Tokens are signed with secure secret key
- Tokens contain minimal user information
- Refresh token mechanism for long-term sessions

#### Client-Side Security
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token inclusion in API requests
- Secure token removal on logout
- Error handling for invalid/expired tokens

#### Server-Side Security
- CORS configuration for frontend domain
- Rate limiting on authentication endpoints
- Input validation and sanitization
- Secure error messages (no sensitive information)

### Integration Points

#### With Existing Components
- **AuthGuard**: Replace NextAuth logic with JWT validation
- **AuthContext**: Replace NextAuth hooks with JWT state management
- **Navigation**: Update to use JWT authentication state
- **API Requests**: Add JWT token to Authorization header

#### With Express Server
- **WebServer.ts**: Add JWT authentication routes
- **Middleware**: Add JWT validation middleware
- **Error Handling**: Integrate with existing error handling system

### Error Handling Strategy

#### Client-Side Errors
- Network errors: Retry with exponential backoff
- Invalid credentials: Clear error messages
- Expired tokens: Automatic logout and redirect
- Server errors: User-friendly error messages

#### Server-Side Errors
- Invalid JWT: Return 401 Unauthorized
- Expired JWT: Return 401 Unauthorized with specific message
- Missing JWT: Return 401 Unauthorized
- Server errors: Return 500 with generic message

### Testing Strategy

#### Unit Tests
- JWT service functions
- Authentication middleware
- AuthContext hooks and state management
- AuthGuard component logic

#### Integration Tests
- Authentication endpoints
- Protected route access
- Token validation flow
- Logout functionality

#### E2E Tests
- Complete login/logout flow
- Session persistence
- Route protection
- Error scenarios

### Migration Strategy

#### Phase 1: Backend Implementation
1. Implement JWT service and middleware
2. Create authentication routes
3. Add JWT dependencies
4. Test backend functionality

#### Phase 2: Frontend Implementation
1. Create JWT AuthContext
2. Update AuthGuard component
3. Implement login/logout UI
4. Test frontend functionality

#### Phase 3: Integration and Cleanup
1. Integrate frontend and backend
2. Remove NextAuth dependencies
3. Update all tests
4. Verify complete functionality

#### Phase 4: Testing and Validation
1. Run all test suites
2. Perform security testing
3. Test error scenarios
4. Validate performance requirements 