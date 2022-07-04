import {getModelSchemaRef} from '@loopback/rest';
import {Order} from '../../models';

export const getOrderCallbackName = (restaurantId: string): string =>
  `${restaurantId}/order`;

export const orderCallbacks = {
  '{$request.body#/restaurantId}/order': {
    post: {
      operationId: 'orderUpdatedByRestaurantId',
      description: 'Listen to orders updated by restaurantId',
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
          description: 'Array of Order model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(Order, {includeRelations: true}),
              },
            },
          },
        },
      },
    },
  },
};
