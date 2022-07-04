import {TokenService} from '@loopback/authentication';
import {
  BindingScope,
  generateUniqueId,
  inject,
  injectable,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {RefreshToken, RefreshTokenRelations} from '../models';
import {RefreshTokenRepository} from '../repositories';
import {MyUserService} from './user-service';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

@injectable({scope: BindingScope.TRANSIENT})
export class RefreshtokenService {
  constructor(
    @inject(RefreshTokenServiceBindings.REFRESH_SECRET)
    private refreshSecret: string,
    @inject(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN)
    private refreshExpiresIn: string,
    @repository(RefreshTokenRepository)
    public refreshTokenRepository: RefreshTokenRepository,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
  ) {}
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  async generateToken(userProfile: UserProfile, token: string) {
    const refreshToken = await signAsync(
      {
        token: generateUniqueId(),
      },
      this.refreshSecret,
      {
        expiresIn: Number(this.refreshExpiresIn),
      },
    );
    const result = {
      accessToken: token,
      refreshToken: refreshToken,
    };
    const userId = +userProfile[securityId];
    await this.refreshTokenRepository.create({
      userId,
      refreshToken,
    });
    const tokenData = await this.refreshTokenRepository.findOne({
      where: {
        userId: +userProfile[securityId],
      },
    });
    if (!tokenData) {
      await this.refreshTokenRepository.create({
        userId: +userProfile[securityId],
        refreshToken: result.refreshToken,
      });
    } else {
      await this.refreshTokenRepository.updateById(tokenData.id, {
        refreshToken: result.refreshToken,
      });
    }
    return result;
  }

  /*
   * Refresh the access token bound with the given refresh token.
   */
  async refreshToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'refresh token' is null`,
        );
      }

      const userRefreshData = await this.verifyToken(refreshToken);
      const user = await this.userService.findUserById(userRefreshData.userId);
      const userProfile: UserProfile = this.userService.convertToUserProfile(
        user,
      );
      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);
      return {
        accessToken: token,
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }

  /*
   * [TODO] test and endpoint
   */
  async revokeToken(refreshToken: string) {
    try {
      await this.refreshTokenRepository.delete(
        new RefreshToken({refreshToken: refreshToken}),
      );
    } catch (e) {
      // ignore
    }
  }

  /**
   * Verify the validity of a refresh token, and make sure it exists in backend.
   * @param refreshToken
   */
  async verifyToken(
    refreshToken: string,
  ): Promise<RefreshToken & RefreshTokenRelations> {
    try {
      await verifyAsync(refreshToken, this.refreshSecret);
      const userRefreshData = await this.refreshTokenRepository.findOne({
        where: {refreshToken: refreshToken},
      });

      if (!userRefreshData) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : Invalid Token`,
        );
      }
      return userRefreshData;
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
