import { IUser } from './IUser';

export interface IRoom {
  id: number;
  OwnerId: number;
  Owner: IUser;
  Members: IUser[];
  name: string;
  createdAt: string;
  updatedAt: string;
  userLimit: number;
  gender: string | null;
  origin: string | null;
  destination: string | null;
  startedAt: string;
}
