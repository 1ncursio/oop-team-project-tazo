export interface IUser {
  id: number;
  email: string;
  nickname: string;
  image: string | null;
  introduction: string | null;
  provider: 'local' | 'kakao';
  snsId: string | null;
  status: number;
  gender: string | null;
  role: number;
  createdAt: string;
  updatedAt: string;
}
