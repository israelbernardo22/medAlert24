
import { Profile as FrontendProfile } from '../types';

// A user account
export interface User {
  id: string;
  email: string;
  // passwordHash is stored in the DB, not in the API responses
}

// A family is a collection of profiles managed by a single user
export interface Family {
  id: string; // same as the userId
  profiles: FrontendProfile[];
}

// We'll add a userId to the Profile for backend use
export interface BackendProfile extends FrontendProfile {
  userId: string;
}
