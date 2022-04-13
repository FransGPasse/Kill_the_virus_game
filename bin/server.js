/*
 *   Module dependencies
 */

const app = require("../app");
const http = require("http");
const socketio = require("socket.io");
const socket_controller = require("../controllers/socket_controller");
const { debug } = require("console");

/*
 *   Port
 */
const port = normalizePort(process.env.PORT || 3000);
app.set("port", port);

/*
 *   Create HTTP server
 */

const server = http.createServer(app);
const io = new socketio.Server(server);

io.on("connection", (socket) => {
  socket_controller(socket, io);
});

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/*
 *   Event listener for HTTP server "error"
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "AccessError":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "AddrInUseError":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/*
 *   Event listener for HTTP server "listening" event
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
