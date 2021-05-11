import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { IRoom } from '@typings/IRoom';
import { IUser } from '@typings/IUser';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import produce from 'immer';
import { css } from '@emotion/react';
import { Link } from 'react-router-dom';

const RoomsList = () => {
  const [name, onChangeName] = useInput('');
  const [userLimit, onChangeUserLimit] = useInput(4);

  const { data: userData, revalidate: userRevalidate } = useSWR<IUser>('/auth', fetcher);
  const { data: roomsData, mutate: mutateRooms } = useSWR<IRoom[]>('/rooms', fetcher);
  const [socket, disconnect] = useSocket('room');

  const createRoom = useCallback(
    async (data: IRoom) => {
      console.log('createRoom 이벤트 발동');
      const rooms = await mutateRooms(
        produce((roomsData) => {
          roomsData?.unshift(data);
        }),
        false
      );
      console.log(rooms);
    },
    [mutateRooms]
  );

  useEffect(() => {
    socket?.on('createRoom', createRoom);
    return () => {
      socket?.off('createRoom', createRoom);
      console.info('disconnect socket', socket);
      disconnect();
    };
  }, [socket, createRoom, disconnect]);

  const onCreateRoom = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post('/rooms', { name, userLimit });
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    },
    [name, userLimit]
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
        <div css={roomStyle} key={room.id}>
          <div>
            <Link to={`/room/${room.id}`}>{room.name}</Link>
          </div>
          <div>{room.Owner.nickname}</div>
          <div>{`방 인원 : ${room.Members.length}/${room.userLimit}`}</div>
          {room.OwnerId === userData?.id && <button onClick={() => onDeleteRoom(room.id)}>방 삭제</button>}
        </div>
      ))}
      <form onSubmit={onCreateRoom} css={formLayout}>
        <label>방 이름</label>
        <input type="text" value={name} onChange={onChangeName} />
        <label>인원 제한</label>
        <input type="number" value={userLimit} onChange={onChangeUserLimit} max={4} min={2} />
        <button type="submit">방 파기</button>
      </form>
    </div>
  );
};

const roomStyle = css`
  display: flex;

  gap: 1rem;
  padding-bottom: 3rem;
`;

const formLayout = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  input,
  button {
    padding: 0.5rem 0.8rem;
  }
`;

export default RoomsList;
