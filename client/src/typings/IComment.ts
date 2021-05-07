import { IUser } from './IUser';

export interface IComment {
  id: number;
  User: IUser;
  UserId: number;
  replyId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}
