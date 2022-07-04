import {securityId, UserProfile} from '@loopback/security';
import {Customer} from '../models';
import {AuthorizationRoles} from '../types/jwt';

export class CustomerService {
  convertToUserProfile(customer: Customer): UserProfile {
    const userProfile = {
      [securityId]: customer.id.toString(),
      id: customer.id,
      roles: [AuthorizationRoles.CUSTOMER],
    };

    return userProfile;
  }
}
