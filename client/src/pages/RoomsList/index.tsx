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
import { Link, useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

const RoomsList = () => {
  const [name, onChangeName] = useInput('영진전문대 파티 구해요~');
  const [userLimit, onChangeUserLimit] = useInput<number>(4);
  const [gender, onChangeGender] = useInput('male');
  const [startAt, onChangeStartAt] = useInput<string>('2021-06-02T10:34:35.675Z');
  const [originLat, onChangeOriginLat] = useInput<number>(0);
  const [originLng, onChangeOriginLng] = useInput<number>(0);
  const [destinationLat, onChangeDestinationLat] = useInput<number>(35.8956224);
  const [destinationLng, onChangeDestinationLng] = useInput<number>(128.62242659999998);

  const history = useHistory();

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

  const destroyRoom = useCallback(
    async (data: IRoom) => {
      console.log('destroyRoom 이벤트 발동');
      const rooms = await mutateRooms(
        produce((roomsData) => {
          roomsData?.filter((v: IRoom) => v.id === data.id);
        })
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

  useEffect(() => {
    socket?.on('destroyRoom', destroyRoom);

    return () => {
      socket?.off('destroyRoom', destroyRoom);
      console.info('disconnect socket', socket);
    };
  }, [socket, destroyRoom, disconnect]);

  // 방에 입장하기 전에는 post 보냄

  const onClickRoom = useCallback(
    (roomId: number) => async () => {
      try {
        const { data } = await axios.post(`/rooms/${roomId}/member`);
        history.push(`/room/${roomId}`);
        console.log(data);
      } catch (error) {
        console.error(error);
        alert(error.response.data.message);
      }
    },
    [history]
  );

  const onCreateRoom = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post('/rooms', {
          name,
          userLimit,
          gender,
          startAt,
          originLat,
          originLng,
          destinationLat,
          destinationLng,
        });
        console.log(data);
      } catch (error) {
        console.error(error);
        alert(error.response.data.message);
      }
    },
    [name, userLimit, gender, startAt, originLat, originLng, destinationLat, destinationLng]
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
            <span>{room.name}</span>
            <button onClick={onClickRoom(room.id)}>입장</button>
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
        <label>성별</label>
        <select value={gender} onChange={onChangeGender}>
          <option value="none">무관</option>
          {userData?.gender === 'male' ? <option value="male">남자</option> : <option value="female">여자</option>}
        </select>
        <label>출발 시간</label>
        <input type="text" value={startAt} onChange={onChangeStartAt} />
        <label>출발 위도</label>
        <input type="number" value={originLat} onChange={onChangeOriginLat} />
        <label>출발 경도</label>
        <input type="number" value={originLng} onChange={onChangeOriginLng} />
        <label>도착 위도</label>
        <input type="number" value={destinationLat} onChange={onChangeDestinationLat} />
        <label>도착 경도</label>
        <input type="number" value={destinationLng} onChange={onChangeDestinationLng} />
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
