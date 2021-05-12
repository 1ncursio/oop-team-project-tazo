import Avatar from '@components/Avatar';
import ChatList from '@components/ChatList';
import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import { IRoom } from '@typings/IRoom';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useRef } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import { Scrollbars } from 'react-custom-scrollbars-2';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [content, onChangeContent, setContent] = useInput('');

  const scrollbarRef = useRef<Scrollbars>(null);
  const uploadImageRef = useRef<HTMLInputElement>(null);

  const { data: roomData } = useSWR<IRoom>(`/rooms/${roomId}`, fetcher);

  const onClickUpload = useCallback(() => {
    uploadImageRef?.current?.click();
  }, []);

  const onUploadImage = useCallback(
    async (e) => {
      console.log(e.target.files);
      try {
        const formData = new FormData();
        [].forEach.call(e.target.files, (file) => {
          formData.append('image', file);
        });
        const { data } = await axios.post(`/room/${roomId}/image`);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    },
    [roomId]
  );

  const onSubmitChat = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post(`/rooms/${roomId}/chat`, { content });
        console.log(data);
        setContent('');
      } catch (error) {
        console.error(error);
      }
    },
    [roomId, content, setContent]
  );

  const onKeyDownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          if (!content.trim()) return;
          e.preventDefault();
          onSubmitChat(e);
        }
      }
    },
    [onSubmitChat, content]
  );

  return (
    <div css={roomStyle}>
      {/* <RoomUserList /> */}
      <header>{`${roomData?.name} - 타조 방`}</header>
      {roomData?.Members?.map((member) => (
        <div css={memberStyle} key={member.id}>
          <Avatar user={member} />
          {roomData.OwnerId === member.id && (
            <span>
              <b>방장</b>
            </span>
          )}
        </div>
      ))}
      <ChatList scrollbarRef={scrollbarRef} />
      <form onSubmit={onSubmitChat} onKeyDown={onKeyDownChat} encType="multipart/form-data">
        <input type="file" hidden onChange={onUploadImage} ref={uploadImageRef} multiple />
        <button type="button" onClick={onClickUpload}>
          사진 업로드
        </button>
        <textarea value={content} onChange={onChangeContent} rows={2} />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

const roomStyle = css`
  display: flex;
  height: 100vh;
  flex-direction: column;
  width: inherit;
  padding-bottom: 3rem;
  header {
    height: 3rem;
    background-color: rgba(30, 30, 30, 0.1);
  }

  form {
    width: inherit;
    display: flex;

    textarea {
      font-family: inherit;
      font-size: 1rem;
      flex: 10;
      resize: none;
    }

    button {
      flex: 1;
    }
  }
`;

const memberStyle = css`
  display: flex;
  gap: 1rem;
`;

export default Room;
