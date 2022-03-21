/*
 *   Socket Controller
 */

const debug = require("debug")("game:socket_controller");
const _ = require("lodash");

let io = null;

const rooms = [
  {
    id: "lobby",
    usernames: ["Kenny"],
  },
];


const handlePlayerJoin = async function (username, callback) {
  debug(`User: ${username}, Socket id: ${this.id} wants to join lobby`);

  let player1;
  let player2;

  const room = rooms.find((room) => room.id === "lobby");

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
      usernames: [player1, player2],
    };
  
    rooms.push(newGameRoom);
  
    // console.log(this)

    this.join(gameRoom);
  
    // callback({
    //   success: true,
    //   gameRoom,
    // });

    // Ta bort två första spelarna från lobbyn  (FUNKAR INTE, UNDERSÖK)
    room.usernames.splice(0, 2);

  } else {
    // Skicka till waiting-screen
    pendingScreen();
  }
};

  /* 
    (X) Skapa ett objekt som är ett rum där namnet genereras för varje gång två spelare matchar.

    (X) Namnet ska genereras som exempelvis "gameroom" sen logik som lägger till en siffra för att namnet ska vara unikt. 

    ( ) Ta bort rummet efter avslutat spel

    ( ) Koppla funktionen till script.js, kanske via module.export längst ner i filen
  */


const pendingScreen = function () {
  console.log("Waiting for opponent");
};

module.exports = function (socket, _io) {
  io = _io;

  io.emit("new-connection", "A new user connected");

  socket.on("user:joined", handlePlayerJoin);
};
