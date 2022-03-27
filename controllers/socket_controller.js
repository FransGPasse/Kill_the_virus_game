/*
 *   Socket Controller
 */

const debug = require("debug")("game:socket_controller");
const _ = require("lodash");

let io = null;
let rounds;

const rooms = [
  // {
  //   id: "lobby",
  //   usernames: [],
  // },
];

const lobby = [];

const handleDisconnect = function () {
  // find the room that this socket is a part of
  const gameRoom = rooms.find((room) => room.usernames.hasOwnProperty(this.id));

  console.log(this.id);
  console.log("gameRoom:", gameRoom);
  // console.log("gameRoom.id:", gameRoom.id)
  // console.log("gameRoom.usernames", gameRoom.usernames)
  // console.log("usernames[this.id]:", gameRoom.usernames[this.id])

  // let everyone in the gameRoom know that this user has disconnected
  io.to(gameRoom.id).emit("user:disconnected", gameRoom.usernames[this.id]);

  // remove user from list of users in that gameRoom
  delete gameRoom.usernames[this.id];

  io.to(gameRoom.id).emit("user:list", gameRoom.usernames);
};

const handleGame = (reactionTime, gameRoomId, callback) => {
  // const currentRoom = rooms.find((room) => room.id === gameRoomId);
  // const clicks = currentRoom.click;
  // const players = currentRoom.usernames;
  // få ut this.id
  // players[this.id].time = reactionTime;
  // clicks = { ...clicks, [this.id]: reactionTime };
  // console.log(clicks);
};

const handlePlayerJoin = async function (username, callback) {
  debug(`User: ${username}, Socket id: ${this.id} wants to join lobby`);

  username[this.id] = username;

  let joinGameRoom;
  // let player1;
  // let player2;

  // const lobby = rooms.find((room) => room.id === "lobby");

  //  lobby.usernames < two, lägg till ny user
  if (lobby.length < 2) {
    lobby.push({ id: this.id, username: username, points: 0, time: 0 });
  }

  // Hitta ett room
  rooms.forEach((room) => {
    const players = this.adapter.rooms.get(room.id); // använd  lodash: _.size istället.
    const numPlayers = players ? players.size : 0;

    if (numPlayers < 2) {
      joinGameRoom = room.id;
    }
  });

  // Skapa nytt rum
  if (!joinGameRoom) {
    let gameRoom = "gameroom";
    let num = 1;

    // Generera unikt id
    do {
      gameRoom += num;
      num++;
    } while (rooms.find((room) => room.id === gameRoom));

    joinGameRoom = gameRoom;

    rooms.push({ id: gameRoom, turns: 0, clicks: [], usernames: {} });
  }

  // Find the gamesession and add the player to it
  const room = rooms.find((obj) => obj.id === joinGameRoom);

  room.usernames = {
    ...room.usernames,
    [this.id]: { name: username, points: 0, time: 0 },
  };

  // Skapa eller gå med i rum via joinGameRoom.
  this.join(joinGameRoom);

  // console.log("log 1:", joinGameRoom);
  // console.log("log 2:", room);
  // console.log("log 3:", room.usernames);

  // console.log("socket rooms", io.sockets.adapter.rooms);

  if (lobby.length >= 2) {
    io.to(joinGameRoom).emit("players:list", room.usernames);
    lobby.splice(0, 2);
  }

  callback(joinGameRoom);

  /** GAMLA VERSIONEN
  room.usernames.push(username);

  // Kolla om det är två eller fler users i lobbyn
  if (_.size(room.usernames) >= 2) {
    console.log(_.size(room.usernames));

    player1 = room.usernames[0];
    player2 = room.usernames[1];

    let gameRoom = "gameroom";
    let num = 1;

    do {
      gameRoom += num;
      num++;
    } while (rooms.find((room) => room.id === gameRoom));

    const newGameRoom = {
      id: gameRoom,
      usernames: {
        player_1: player1,
        player_2: player2,
      },
    };

    rooms.push(newGameRoom);

    // console.log(this)

    const activeGameRoom = rooms.find((room) => room.id === gameRoom);

    this.join(activeGameRoom);

    // UNDERSÖK VARFÖR CALLBACK INTE FUNKAR
    // callback({
    //   success: true,
    //   room: activeGameRoom,
    // });

    // console.log(activeGameRoom.usernames)
    // console.log(rooms)

    // console.log(activeGameRoom.usernames)
    // this.broadcast.to(activeGameRoom.id).emit('players:list', activeGameRoom.usernames);
    this.emit('players:list', activeGameRoom.usernames);


    console.log(activeGameRoom.usernames)

    room.usernames.splice(0, 2);
  } else {
    // Skicka till waiting-screen
    console.log("Waiting for opponent");
  }

  */
};

module.exports = function (socket, _io) {
  io = _io;

  io.emit("new-connection", "A new user connected");

  socket.on("user:joined", handlePlayerJoin);

  socket.on("user:virusclick", handleGame);

  socket.on("disconnect", handleDisconnect);
};
