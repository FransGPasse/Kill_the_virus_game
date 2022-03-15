
/*
*   Module dependencies
*/

const app = require('../app');
const http = require('http');
const socketio = require('socket.io');
const socket_controller = require('../controllers/socket_controller');



/*
*   Create HTTP server
*/

const server = http.createServer(app);
const io = new socketio.Server(server);

io.on('connection', socket => {
    socket_controller(socket, io);
})