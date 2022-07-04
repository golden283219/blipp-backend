export enum OrderStatus {
  NOT_ORDERED = 'NOT_ORDERED',
  ORDERED = 'ORDERED',
  PREPARING = 'PREPARING',
  DONE = 'DONE',
  DELIVERED = 'DELIVERED',
}

export const ActiveOrderStatuses = [OrderStatus.ORDERED, OrderStatus.PREPARING];
