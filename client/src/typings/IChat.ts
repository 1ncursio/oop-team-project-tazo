import { IUser } from './IUser';

export interface IChat {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  UserId: number;
  RoomId: number;
  User: IUser;
}
