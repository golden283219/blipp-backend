import {TokenService, UserService} from '@loopback/authentication';
import {RefreshTokenService} from '@loopback/authentication-jwt';
import {BindingKey} from '@loopback/context';
import {User} from './models';
import {Credentials} from './repositories';
import {PasswordHasher} from './services/hash-service';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.TOKEN_SECRET;
  export const TOKEN_EXPIRES_IN_VALUE = '7200';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
  export const DATASOURCE_NAME = 'db';
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialRepository';
}

export namespace RefreshTokenConstants {
  export const REFRESH_SECRET_VALUE = process.env.REFRESH_SECRET!;
  export const REFRESH_EXPIRES_IN_VALUE = '2629746';
  export const REFRESH_ISSUER_VALUE = 'loopback4';
}

export namespace RefreshTokenServiceBindings {
  export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
    'services.authentication.jwt.refresh.tokenservice',
  );
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.refresh.expires.in.seconds',
  );
  export const REFRESH_ISSUER = BindingKey.create<string>(
    'authentication.jwt.refresh.issuer',
  );
  /**
   * The backend datasource for refresh token's persistency.
   */
  export const DATASOURCE_NAME = 'refreshdb';
  /**
   * Key for the repository that stores the refresh token and its bound user
   * information
   */
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}

export namespace AuthorizationBindings {
  export const AUTHORIZATION_PROVIDER =
    'authorizationProviders.AuthorizationProvider';
}
