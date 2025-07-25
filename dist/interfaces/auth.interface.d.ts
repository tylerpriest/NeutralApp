import { AuthResult, ValidationResult, User, UserMetadata, Session, UserProfile } from '../types';
export interface IAuthenticationService {
    signUp(email: string, password: string, metadata?: UserMetadata): Promise<AuthResult>;
    signIn(email: string, password: string): Promise<AuthResult>;
    signOut(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    updatePassword(newPassword: string): Promise<void>;
    getCurrentUser(): User | null;
    onAuthStateChange(callback: (user: User | null) => void): () => void;
    validateCredentials(email: string, password: string): Promise<ValidationResult>;
    displayRegistrationAndLogin(): void;
    sendEmailVerification(email: string): Promise<void>;
}
export interface ISessionManager {
    getSession(): Session | null;
    refreshSession(): Promise<Session | null>;
    isAuthenticated(): boolean;
    getUserProfile(): Promise<UserProfile | null>;
    handleSessionExpiry(intendedDestination?: string): void;
    preserveDestination(path: string): void;
    getPreservedDestination(): string | null;
    terminateSession(): Promise<void>;
    clearAuthTokens(): void;
}
//# sourceMappingURL=auth.interface.d.ts.map