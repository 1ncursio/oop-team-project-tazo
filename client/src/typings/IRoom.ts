import { IUser } from './IUser';

export interface IRoom {
  id: number;
  OwnerId: number;
  Owner: IUser;
  name: string;
  createdAt: string;
  updatedAt: string;
}
