import {TokenObject} from '@loopback/authentication-jwt';
import {
  AuthorizationDecision,
  AuthorizationOptions,
} from '@loopback/authorization';
import {UserProfile} from '@loopback/security';

export interface RefreshTokenService {
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  generateToken(userProfile: UserProfile, token: string): Promise<TokenObject>;

  /**
   * Refresh the access token bound with the given refresh token.
   */
  refreshToken(refreshToken: string): Promise<TokenObject>;
}

export enum AuthorizationRoles {
  CUSTOMER = 'Customer',
  RESTAURANT = 'Restaurant',
  ADMIN = 'Admin',
}

export const authorizationOptions: AuthorizationOptions = {
  precedence: AuthorizationDecision.DENY,
  defaultDecision: AuthorizationDecision.DENY,
};
