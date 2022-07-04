import {authenticate, TokenService} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  model,
  property,
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  SchemaObject,
} from '@loopback/rest';
import _ from 'lodash';
import {
  PasswordHasherBindings,
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasher} from '../services/hash-service';
import {RefreshtokenService} from '../services/refreshtoken-service';
import {MyUserService} from '../services/user-service';
import {AuthorizationRoles} from '../types/jwt';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 8,
    },
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
const RefreshSchema: SchemaObject = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
    },
  },
};

export const RefreshTokenRequestBody = {
  description: 'Refresh token',
  required: true,
  content: {
    'application/json': {schema: RefreshSchema},
  },
};

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshService: RefreshtokenService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    const email = newUserRequest.email.trim();
    const password = newUserRequest.password.trim();
    const existingUser = await this.userRepository.findOne({where: {email}});
    if (existingUser) {
      throw new HttpErrors.BadRequest('This email user already existis');
    }
    const hashedPassword = await this.passwordHasher.hashPassword(password);
    const savedUser = await this.userRepository.create(
      _.omit({...newUserRequest, email}, 'password'),
    );

    await this.userRepository
      .userCredential(savedUser.id)
      .create({password: hashedPassword});

    return savedUser;
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
                refreshToken: {
                  type: 'string',
                },
                restaurantId: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{
    accessToken: string;
    refreshToken: string | null;
    restaurantId: number;
  }> {
    const email = credentials.email.trim();
    const password = credentials.password.trim();
    const user = await this.userService.verifyCredentials({email, password});
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    const tokens = await this.refreshService.generateToken(userProfile, token);
    return {...tokens, restaurantId: user.restaurantId};
  }

  @post('/refresh_token', {
    responses: {
      '200': {
        description: 'Return token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async refreshToken(
    @requestBody(RefreshTokenRequestBody) refreshToken: {refreshToken: string},
  ) {
    const token = await this.refreshService.refreshToken(
      refreshToken.refreshToken,
    );
    return token;
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
