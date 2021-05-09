import { useCallback } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:7005';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (room?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (room) {
      sockets[room].disconnect();
      delete sockets[room];
    }
  }, [room]);
  if (!room) {
    return [undefined, disconnect];
  }

  if (!sockets[room]) {
    sockets[room] = io.connect(`${BACKEND_URL}/ws-${room}`, { transports: ['websocket'] });
  }

  return [sockets[room], disconnect];
};

export default useSocket;
