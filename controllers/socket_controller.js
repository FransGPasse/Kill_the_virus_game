/*
 *   Socket Controller
 */

const debug = require("debug")("game:socket_controller");
const _ = require("lodash");

let io = null;

const users = {};
const rooms = [
  {
    id: "lobby",
    name: "Lobby",
    users: {},
  },
];

const handlePlayerJoin = function (username, lobby, callback) {
  debug(`User: ${username}, Socket id: ${this.id} wants to join lobby`);

  const room = rooms.find((room) => room.id === "lobby");

  room.users[this.id] = username;

  // confirm join
  callback({
    success: true,
    roomname: room.name,
    users: room.users,
  });

  // Kolla om det är två eller fler users i lobbyn
  if (_.size(room.users) >= 2) {
    // Starta
    startGame(users);
  } else {
    // Skicka till waiting-screen
    pendingScreen();
  }
};

const startGame = function (player1, player2) {};

const pendingScreen = function () {};
