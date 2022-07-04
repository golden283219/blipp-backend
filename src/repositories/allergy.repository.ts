import {DefaultCrudRepository} from '@loopback/repository';
import {Allergy, AllergyRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AllergyRepository extends DefaultCrudRepository<
  Allergy,
  typeof Allergy.prototype.id,
  AllergyRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Allergy, dataSource);
  }
}
