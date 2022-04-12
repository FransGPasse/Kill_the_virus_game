/*
 *   Socket Controller
 */

const debug = require("debug")("game:socket_controller");
const _ = require("lodash");

let io = null;

const rooms = [];

const lobby = [];

/**
 *  Functions
 */

const handleDisconnect = function () {
  // Hitta nuvarande rum
  const gameRoom = rooms.find(gameRoom => gameRoom.usernames.hasOwnProperty(this.id))

  if (gameRoom) {
    // Nollställ rum efter spelaren lämnat
    let { id, turns, points, usernames } = gameRoom;
    const opponent = usernames[!this.id]
    delete usernames[this.id];
    turns = 0;
    points = 0;
    
    // broadcast till rummer att spelaren lämnade
    this.broadcast.to(id).emit('players:list', usernames);
    io.to(id).emit('player:disconnected', usernames);


  } else {
    console.log("No gameroom was found.")
  }

};


const handleGame = async function (reactionTime, gameRoomId) {
  // Hitta rätt rum
  const currentRoom = rooms.find((room) => room.id === gameRoomId);
  const players = currentRoom.usernames;
  let player = players[this.id];

  // tilldela tiden för spelaren att klicka
  players[this.id].time = reactionTime;

  // uppdatera reactiontime i array och pusha in i clicks
  player = { ...player, time: reactionTime };
  currentRoom.clicks.push({ ...player, id: this.id });

  this.emit("player:point", this.id, currentRoom);

  io.to(gameRoomId).emit("player:time", reactionTime);

  if (currentRoom.clicks.length === 2) {
    currentRoom.turns = currentRoom.turns + 1;

    const roundWinnerId = currentRoom.clicks[0].id;
    const opponentId = Object.values(currentRoom.usernames).find(
      (obj) => obj.id !== this.id
    ).id;

    // console.log(currentRoom)

    currentRoom.usernames[roundWinnerId].points += 1;

    // console.log(currentRoom.usernames[roundWinnerId].points);

    // Avsluta spelet när tio rundor har gått
    if (currentRoom.turns === 10) {
      const theWinner = currentRoom.usernames[roundWinnerId];
      console.log("nu ska spelet vara slut", theWinner);
      io.to(gameRoomId).emit("game:over", theWinner);
    }

    io.to(gameRoomId).emit(
      "player:win",
      this.id,
      roundWinnerId,
      opponentId,
      currentRoom
    );

    currentRoom.clicks = [];
  }
};

const handlePlayerJoin = async function (username, callback) {
  debug(`User: ${username}, Socket id: ${this.id} wants to join lobby`);

  username[this.id] = username;

  let joinGameRoom;

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
    [this.id]: { id: this.id, name: username, points: 0, time: 0 },
  };

  // Skapa eller gå med i rum via joinGameRoom.
  this.join(joinGameRoom);

  if (lobby.length >= 2) {
    io.to(joinGameRoom).emit("players:list", room.usernames);
    lobby.splice(0, 2);
  }

  callback(joinGameRoom);
};

module.exports = function (socket, _io) {
  io = _io;

  io.emit("new-connection", "A new user connected");

  socket.on("user:joined", handlePlayerJoin);

  socket.on("user:virusclick", handleGame);

  socket.on("disconnect", handleDisconnect);
};
