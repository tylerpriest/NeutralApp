# Authentication API Reference

## Overview

The NeutralApp Authentication API provides JWT-based authentication for secure user access. This reference documents all authentication endpoints, request/response formats, and best practices.

## Quick Start

### Authentication Flow

1. **Login**: POST `/api/auth/signin` with email/password
2. **Session Check**: GET `/api/auth/session` with JWT token
3. **Token Refresh**: POST `/api/auth/refresh` with refresh token
4. **Logout**: POST `/api/auth/signout` to invalidate session

### Example Usage

```javascript
// Login
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
localStorage.setItem('auth_token', token);

// Use token for authenticated requests
const sessionResponse = await fetch('/api/auth/session', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Authentication Endpoints

### POST /api/auth/signin

Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-here"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### GET /api/auth/session

Retrieves the current user session using the JWT token.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### POST /api/auth/refresh

Refreshes an expired JWT token using a refresh token.

**Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token-here"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

### POST /api/auth/signout

Logs out the current user and invalidates the session.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Security Considerations

### JWT Token Security

- **Expiration**: Access tokens expire after 1 hour
- **Refresh**: Use refresh tokens to get new access tokens
- **Storage**: Store tokens securely in localStorage or httpOnly cookies
- **Transmission**: Always use HTTPS in production

### Best Practices

1. **Token Management**: Implement automatic token refresh
2. **Error Handling**: Handle 401 responses by redirecting to login
3. **Logout**: Clear tokens on logout and redirect to login page
4. **Validation**: Validate tokens on both client and server side

## Frontend Integration

### React Context Usage

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password123');
    if (success) {
      // Redirect to dashboard
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

```typescript
import { AuthGuard } from '../components/AuthGuard';

function App() {
  return (
    <Router>
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    </Router>
  );
}
```

## Performance

### Response Times

- **Login**: < 200ms
- **Session Check**: < 100ms
- **Token Refresh**: < 100ms
- **Logout**: < 50ms

### Caching

- Session data is cached in memory
- Tokens are validated locally when possible
- Refresh tokens have longer expiration for reduced API calls

## Testing

### Test Credentials

For development and testing, use these credentials:

```
Email: test@example.com
Password: password123
```

### Mock Responses

```typescript
// Mock successful login
const mockLoginResponse = {
  success: true,
  data: {
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token'
  }
};
```

## Migration from NextAuth

### Key Changes

1. **Endpoints**: Changed from NextAuth endpoints to custom JWT endpoints
2. **Tokens**: Now using JWT tokens instead of NextAuth sessions
3. **Storage**: localStorage instead of NextAuth session storage
4. **Context**: Custom AuthContext instead of NextAuth SessionProvider

### Migration Checklist

- [x] Remove NextAuth dependencies
- [x] Update authentication endpoints
- [x] Implement JWT token management
- [x] Update frontend components
- [x] Test authentication flow
- [x] Update documentation 