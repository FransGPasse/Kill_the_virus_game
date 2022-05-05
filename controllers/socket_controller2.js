let io = null;

const rooms = [];

const lobby = [];

const handlePlayerJoin = async function (username, callback) {
  username[this.id] = username;

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
    generateNewPosition();
  }

  callback(joinGameRoom);
};

module.exports = function (socket, _io) {
  io = _io;

  socket.on("user:joined", handlePlayerJoin);
};
