import { IComment } from './IComment';
import { IImage } from './IImage';
import { IUser } from './IUser';

export interface IPost {
  id: number;
  User: IUser;
  UserId: number;
  title: string;
  content: string;
  PostImages: IImage[];
  PostComments: IComment[];
  views: string;
  origin: string;
  destination: string;
  startAt: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
}
