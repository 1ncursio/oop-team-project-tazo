import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IRoom } from '@typings/IRoom';
import { IUser } from '@typings/IUser';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect } from 'react';
import useSWR from 'swr';

const Room = () => {
  const [name, onChangeName] = useInput('');

  const { data: userData, revalidate: userRevalidate } = useSWR<IUser>('/auth', fetcher);
  const { data: roomsData, mutate: mutateRooms, revalidate: revalidateRooms } = useSWR<IRoom[]>('/rooms', fetcher);
  const [socket] = useSocket('room');

  const onRoomList = useCallback(
    (data: IRoom) => {
      console.log('roomList 이벤트 발동');
      mutateRooms((roomsData) => {
        roomsData?.unshift(data);
        return roomsData;
      }, false).then((rooms) => {
        console.log(rooms);
      });
    },
    [mutateRooms]
  );

  useEffect(() => {
    socket?.on('roomList', onRoomList);
    return () => {
      socket?.off('roomList', onRoomList);
    };
  }, [socket, onRoomList]);

  useEffect(() => {
    if (roomsData) console.log(roomsData);
  }, [roomsData]);

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

  const onDeleteRoom = useCallback(async (roomId) => {
    try {
      const { data } = await axios.delete(`/rooms/${roomId}`);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div>
      {roomsData?.map((room) => (
        <div>
          <div>{room.name}</div>
          {room.OwnerId === userData?.id && <button onClick={() => onDeleteRoom(room.id)}>방 삭제</button>}
        </div>
      ))}
      <form onSubmit={onCreateRoom}>
        <input type="text" value={name} onChange={onChangeName} />
        <button type="submit">방 파기</button>
      </form>
    </div>
  );
};

export default Room;
