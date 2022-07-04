import {getModelSchemaRef} from '@loopback/rest';
import {Restaurant} from '../../models';

export const getRestaurantCallbackName = (restaurantId: string): string =>
  `${restaurantId}/restaurant`;

export const restaurantCallbacks = {
  '{$request.body#/restaurantId}/restaurant': {
    post: {
      operationId: 'watchRestaurantUpdates',
      description: 'Listen to updates to restaurant by restaurantId',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['restaurantId'],
              properties: {
                restaurantId: {
                  type: 'number',
                },
                // int is for updating the subscription on an interval in the tablet app
                int: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Restaurant model instances',
          content: {
            'application/json': {
              schema: getModelSchemaRef(Restaurant),
            },
          },
        },
      },
    },
  },
};
