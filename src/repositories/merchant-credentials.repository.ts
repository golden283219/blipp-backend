import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MerchantCredentials, MerchantCredentialsRelations, Restaurant} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {RestaurantRepository} from './restaurant.repository';

export class MerchantCredentialsRepository extends DefaultCrudRepository<
  MerchantCredentials,
  typeof MerchantCredentials.prototype.id,
  MerchantCredentialsRelations
> {

  public readonly restaurant: BelongsToAccessor<Restaurant, typeof MerchantCredentials.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('RestaurantRepository') protected restaurantRepositoryGetter: Getter<RestaurantRepository>,
  ) {
    super(MerchantCredentials, dataSource);
    this.restaurant = this.createBelongsToAccessorFor('restaurant', restaurantRepositoryGetter,);
  }
}
