const SocketIO = require('socket.io');
let waitingQueue = require('./utils/waitingQueue');

const onlineMap = {};
const waitingMap = {};

module.exports = (server, app) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  app.set('onlineMap', onlineMap);
  app.set('waitingMap', waitingMap);

  const dynamicNsp = io.of(/^\/ws-.+$/).on('connect', (socket) => {
    const newNamespace = socket.nsp; // newNamespace.name === 'dynamic-101'
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    // broadcast to all clients in the given sub-namespace
    socket.emit('hello', socket.nsp.name);
    socket.on('login', ({ id, channels }) => {
      onlineMap[socket.nsp.name][socket.id] = id;
      newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
      channels.forEach((channel) => {
        socket.join(`${socket.nsp.name}-${channel}`);
      });
    });
    socket.on('disconnect', () => {
      delete onlineMap[socket.nsp.name][socket.id];
      newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
    });
  });

  io.of(/^\/ws-.+$/).on('disconnect', (socket) => {
    console.log('클라이언트 소켓 연결 해제됨', 'socket.id', socket.id);
  });

  // const waitingQueueSocket = io.of('/queue').on('connect', (socket) => {
  //   socket.emit('hello', socket.nsp.name);
  //   socket.on(
  //     'enterQueue',
  //     ({ id, gender, originName, destinationName, originLat, originLng, destinationLat, destinationLng }) => {
  //       waitingMap[socket.id] = {};
  //       waitingMap[socket.id]['UserId'] = id;
  //       waitingMap[socket.id]['originName'] = originName;
  //       waitingMap[socket.id]['destinationName'] = destinationName;
  //       waitingMap[socket.id]['originLat'] = originLat;
  //       waitingMap[socket.id]['originLng'] = originLng;
  //       waitingMap[socket.id]['destinationLat'] = destinationLat;
  //       waitingMap[socket.id]['destinationLng'] = destinationLng;

  //       // if ()

  //       // socket.emit
  //     }
  //   );
  // });

  // io.of('/ws-queue').on('connect', socket => {
  //   waitingMap[socket.id]
  // });

  // io.of('/ws-queue').on('disconnect', () => {
  //   waitingQueue
  // });

  // app.get('/testas', (req, res) => {
  //   return res.status(200).json({ success: true });
  // });
};
