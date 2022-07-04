import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';
import {AuthorizationRoles} from '../types/jwt';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  convertRoles(allowedRoles: string[]) {
    return allowedRoles.map((role: string) => role);
  }

  async authorize(
    authorizationContext: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    const userProfile = authorizationContext.principals[0].roles;
    const allowedRoles = this.convertRoles(metadata.allowedRoles!);
    return userProfile.some((role: AuthorizationRoles) =>
      allowedRoles.includes(role),
    )
      ? AuthorizationDecision.ALLOW
      : AuthorizationDecision.DENY;
  }
}
