import {getModelSchemaRef} from '@loopback/rest';
import {Table} from '../../models';

export const getTableCallbackName = (restaurantId: string): string =>
  `${restaurantId}/table`;

export const tableCallbacks = {
  '{$request.body#/restaurantId}/table': {
    post: {
      operationId: 'tableUpdatedByRestaurantId',
      description: 'Listen to tables updated by restaurantId',
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
          description: 'Array of Table model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(Table, {includeRelations: true}),
              },
            },
          },
        },
      },
    },
  },
};
