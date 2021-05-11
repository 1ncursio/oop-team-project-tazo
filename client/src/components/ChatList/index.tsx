import Chat from '@components/Chat';
import fetcher from '@utils/fetcher';
import React from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';

const ChatList = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { data: chatData } = useSWR(`/rooms/${roomId}/chat`, fetcher);

  return (
    <>
      chatList
      <Chat data={chatData}></Chat>
    </>
  );
};

export default ChatList;
