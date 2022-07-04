import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {
  getRestaurantCallbackName,
  restaurantCallbacks,
} from '../components/callbacks';
import {OpeningHours, Restaurant} from '../models';
import pubsub from '../pubsub';
import {RestaurantRepository} from '../repositories';
import {AllWeekdays} from '../types';
import {AllDeliveryTypes} from '../types/deliveryTypes';
import {AuthorizationRoles} from '../types/jwt';
import {
  dayCheck,
  openingHoursHandler,
  timeCheck,
} from '../utils/openingHoursUtils';

export class RestaurantController {
  constructor(
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
  ) {}
  @authenticate('jwt')
  async notifyRestaurant(restaurantId: number) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    const topic = getRestaurantCallbackName(`${restaurantId}`);
    console.log('topic', topic);
    const payload = restaurant;
    await pubsub.publish(topic, payload);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @post('/restaurants', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {'application/json': {schema: getModelSchemaRef(Restaurant)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurant, {
            title: 'NewRestaurant',
            exclude: ['id'],
          }),
        },
      },
    })
    restaurant: Omit<Restaurant, 'id'>,
  ): Promise<Restaurant> {
    const {openingHours} = restaurant;
    const completeOpeningHours = openingHoursHandler(openingHours);
    restaurant.openingHours = completeOpeningHours!;

    const createdRestaurant = await this.restaurantRepository.create(
      restaurant,
    );
    return createdRestaurant;
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/restaurants/count', {
    responses: {
      '200': {
        description: 'Restaurant model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Restaurant) where?: Where<Restaurant>,
  ): Promise<Count> {
    return this.restaurantRepository.count(where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @get('/restaurants', {
    responses: {
      '200': {
        description: 'Array of Restaurant model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Restaurant, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Restaurant) filter?: Filter<Restaurant>,
  ): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      ...filter,
      include: ['orders', 'productGroups', 'cashRegisterSystems', 'currency'],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @patch('/restaurants', {
    responses: {
      '200': {
        description: 'Restaurant PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurant, {partial: true}),
        },
      },
    })
    restaurant: Restaurant,
    @param.where(Restaurant) where?: Where<Restaurant>,
  ): Promise<Count> {
    return this.restaurantRepository.updateAll(restaurant, where);
  }

  @get('/restaurants/{id}', {
    responses: {
      '200': {
        description: 'Restaurant model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Restaurant, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Restaurant, {exclude: 'where'})
    filter?: FilterExcludingWhere<Restaurant>,
  ): Promise<Restaurant> {
    return this.restaurantRepository.findById(id, {
      ...filter,
      include: ['orders', 'productGroups', 'currency', 'deliveryCost'],
    });
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/restaurants/{id}', {
    responses: {
      '204': {
        description: 'Restaurant PATCH success',
      },
    },
    callbacks: {
      restaurantCallbacks,
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurant, {partial: true}),
        },
      },
    })
    restaurant: Restaurant,
  ): Promise<void> {
    await this.restaurantRepository.updateById(id, restaurant);
    await this.notifyRestaurant(id);
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/restaurants/{id}/{deliveryType}/{time}/setPreparationTime', {
    responses: {
      '204': {
        description: 'Restaurant PATCH success',
      },
    },
  })
  async setPreparationTime(
    @param.path.number('id') id: number,
    @param.path.string('deliveryType') deliveryType: string,
    @param.path.number('time') time: number,
  ): Promise<void> {
    if (AllDeliveryTypes.some(type => type === deliveryType)) {
      const restaurant = await this.restaurantRepository.findById(id);
      const preparationTimes = restaurant.preparationTimes ?? [];
      const newPreparationTime = {deliveryType, time};
      const preparationWasSetForDeliveryType = preparationTimes.some(
        prepTime => prepTime.deliveryType === deliveryType,
      );
      const updatedPreparationTimes = preparationWasSetForDeliveryType
        ? preparationTimes.map(prepTime =>
            prepTime.deliveryType === deliveryType
              ? newPreparationTime
              : prepTime,
          )
        : [...preparationTimes, newPreparationTime];
      await this.restaurantRepository.updateById(id, {
        preparationTimes: updatedPreparationTimes,
      });
      await this.notifyRestaurant(id);
    }
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.RESTAURANT, AuthorizationRoles.ADMIN],
  })
  @patch('/restaurants/{id}/setOpeningHours', {
    responses: {
      '204': {
        description: 'Restaurant PATCH success',
      },
    },
  })
  async setOpeningHours(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OpeningHours, {partial: true}),
        },
      },
    })
    openingHours: OpeningHours,
  ): Promise<Boolean> {
    if (timeCheck([openingHours]).length === 0) return false;
    if (dayCheck([openingHours]).length === 0) return false;

    if (AllWeekdays.some(type => type === openingHours.day)) {
      const restaurant = await this.restaurantRepository.findById(id);
      const oldRestaurantHours = restaurant.openingHours ?? [];

      const updatedOpeningHours = oldRestaurantHours.map(existingTimes =>
        existingTimes.day === openingHours.day ? openingHours : existingTimes,
      );

      await this.restaurantRepository.updateById(id, {
        openingHours: updatedOpeningHours,
      });
    }

    return true;
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @put('/restaurants/{id}', {
    responses: {
      '204': {
        description: 'Restaurant PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() restaurant: Restaurant,
  ): Promise<void> {
    await this.restaurantRepository.replaceById(id, restaurant);
  }
  @authenticate('jwt')
  @authorize({
    allowedRoles: [AuthorizationRoles.ADMIN],
  })
  @del('/restaurants/{id}', {
    responses: {
      '204': {
        description: 'Restaurant DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.restaurantRepository.deleteById(id);
  }
}
