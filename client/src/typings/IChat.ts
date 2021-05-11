import { IUser } from './IUser';

export interface IChat {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  RoomId: number;
  UserId: number;
  User: IUser;
}
