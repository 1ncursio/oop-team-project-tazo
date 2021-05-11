import { useCallback } from 'react';
import io from 'socket.io-client';
import backUrl from '@utils/backUrl';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (namespace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (namespace && sockets[namespace]) {
      sockets[namespace].disconnect();
      delete sockets[namespace];
    }
  }, [namespace]);
  if (!namespace) {
    return [undefined, disconnect];
  }

  if (!sockets[namespace]) {
    sockets[namespace] = io.connect(`${backUrl}/ws-${namespace}`, { transports: ['websocket'] });
    console.info('create socket', namespace, sockets[namespace]);
  }

  return [sockets[namespace], disconnect];
};

export default useSocket;
