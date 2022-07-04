export enum DeliveryType {
  RESERVATION = 'RESERVATION',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export enum DeliveryStatus {
  RESERVATION = 'reservationStatus',
  TAKEAWAY = 'takeawayStatus',
  DELIVERY = 'deliveryStatus',
}

export const AllDeliveryTypes = [
  DeliveryType.RESERVATION,
  DeliveryType.TAKEAWAY,
  DeliveryType.DELIVERY,
];
