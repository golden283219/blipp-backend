import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {RefreshToken, User} from '../models';
import {RefreshTokenRepository} from '../repositories';
import {AuthorizationRoles} from '../types/jwt';

@authenticate('jwt')
@authorize({
  allowedRoles: [AuthorizationRoles.ADMIN],
})
export class RefreshTokenUserController {
  constructor(
    @repository(RefreshTokenRepository)
    public refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @get('/refresh-tokens/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to RefreshToken',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof RefreshToken.prototype.id,
  ): Promise<User> {
    return this.refreshTokenRepository.user(id);
  }
}
