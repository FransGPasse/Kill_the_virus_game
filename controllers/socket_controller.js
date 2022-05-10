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
  const gameRoom = rooms.find((gameRoom) =>
    gameRoom.usernames.hasOwnProperty(this.id)
  );

  if (gameRoom) {
    // Nollställ rum efter spelaren lämnat
    let { id, turns, points, usernames } = gameRoom;
    const opponent = usernames[!this.id];
    delete usernames[this.id];
    turns = 0;
    points = 0;

    // broadcast till rummer att spelaren lämnade
    this.broadcast.to(id).emit("players:list", usernames);
    io.to(id).emit("player:disconnected", usernames);
  } else {
    console.log("No gameroom was found.");
  }
};

const handleGame = async function (reactionTime, gameRoomId) {
  // Hitta rätt rum
  const currentRoom = rooms.find((room) => room.id === gameRoomId);
  const players = currentRoom.usernames;
  let player = players[this.id];

  console.log("Här är player som är this id av players", player);

  // tilldela tiden för spelaren att klicka
  players[this.id].time = reactionTime;

  // uppdatera reactiontime i array och pusha in i clicks
  player = { ...player, time: reactionTime };
  currentRoom.clicks.push({ ...player, id: this.id });

  this.emit("player:point", this.id, currentRoom);

  console.log("Här är currentRoom.clicks ", currentRoom.clicks);

  if (currentRoom.clicks.length === 2) {
    let mappedUserId = Object.values(players).map((username) => username.id);

    let opponentUserId = mappedUserId.filter(
      (opponent) => opponent !== this.id
    );

    const yourTime = players[this.id].time;
    const opponentTime = players[opponentUserId].time;

    io.to(gameRoomId).emit("player:time", yourTime, opponentTime);

    currentRoom.turns = currentRoom.turns + 1;

    const roundWinnerId = currentRoom.clicks[0].id;
    const opponentId = Object.values(currentRoom.usernames).find(
      (obj) => obj.id !== this.id
    ).id;

    currentRoom.usernames[roundWinnerId].points += 1;

    const player1 = players[this.id];
    const player2 = currentRoom.usernames[opponentId];

    console.log(currentRoom["turns"]);

    // Avsluta spelet när tio rundor har gått
    if (currentRoom["turns"] === 5) {
      const player1 = players[this.id];
      const player2 = currentRoom.usernames[opponentId];
      io.to(gameRoomId).emit("game:over", player1, player2);
      turns = 0;
    }

    io.to(gameRoomId).emit(
      "round:win",
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

    rooms.push({
      id: gameRoom,
      turns: 0,
      clicks: [],
      position: {},
      usernames: {},
    });
  }

  // Find the gamesession and add the player to it
  const room = rooms.find((obj) => obj.id === joinGameRoom);

  console.log("Här är room", room);

  room.usernames = {
    ...room.usernames,
    [this.id]: { id: this.id, name: username, points: 0, time: 0 },
  };

  // Skapa eller gå med i rum via joinGameRoom.
  this.join(joinGameRoom);

  if (lobby.length >= 2) {
    io.to(joinGameRoom).emit("players:list", room.usernames);
    lobby.splice(0, 2);

    //! Här är typ det som Johan hjälpte oss med! Osäkert om det ska vara här eller i handleGame kanske men något sånt här hade varit optimalt
    const newPosition = generateNewPosition();
    io.to(joinGameRoom).emit("virus:position", newPosition);
  }

  callback(joinGameRoom);
};

const generateNewPosition = () => {
  // Random numbers for grid
  let randomGridNumberX = Math.floor(Math.random() * 11);
  let randomGridNumberY = Math.floor(Math.random() * 11);

  // Adding the styling in a object so the virus can move around randon
  let randomGrid = {
    gridColumnStart: randomGridNumberX,
    gridColumnEnd: ++randomGridNumberX,
    gridRowStart: randomGridNumberY,
    gridRowEnd: ++randomGridNumberY,
  };

  return randomGrid;

  /*   rooms.position = randomGrid;

  console.log("Här är rooms ", rooms);

  io.emit("virus:position", randomGrid, rooms.position); */
};

const gamePlay = () => {
  let delay = Math.floor(Math.random() * 5);
  setTimeout(() => {
    generateNewPosition();
  }, parseInt(delay * 1000));
};

module.exports = function (socket, _io) {
  io = _io;

  io.emit("new-connection", "A new user connected");

  socket.on("user:joined", handlePlayerJoin);

  socket.on("user:virusclick", handleGame);

  socket.on("game:new", gamePlay);

  socket.on("disconnect", handleDisconnect);
};
