import useInput from '@hooks/useInput';
import { IRoom } from '@typings/IRoom';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback } from 'react';
import useSWR from 'swr';

const Room = () => {
  const [name, onChangeName] = useInput('');
  const { data: roomsData, revalidate: roomsRevalidate } = useSWR<IRoom[]>('/posts?perPage=10&page=1', fetcher);

  const onCreateRoom = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post('/rooms', { name });
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    },
    [name]
  );

  return (
    <div>
      {roomsData?.map((room) => (
        <div>{room.name}</div>
      ))}
      <form onSubmit={onCreateRoom}>
        <input type="text" value={name} onChange={onChangeName} />
        <button type="submit">방 파기</button>
      </form>
    </div>
  );
};

export default Room;
