import {Entity, model, property} from '@loopback/repository';

@model()
export class SubcategoryOrderType extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  itemSubcategoryId?: number;

  @property({
    type: 'number',
  })
  orderTypeId?: number;

  constructor(data?: Partial<SubcategoryOrderType>) {
    super(data);
  }
}

export interface SubcategoryOrderTypeRelations {
  // describe navigational properties here
}

export type SubcategoryOrderTypeWithRelations = SubcategoryOrderType & SubcategoryOrderTypeRelations;
