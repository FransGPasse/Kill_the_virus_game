/*
 *   Socket Controller
 */

const debug = require("debug")("game:socket_controller");
const _ = require("lodash");

let io = null;

// const users = []

const rooms = [
  {
    id: "lobby",
    name: "Lobby",
    usernames: [],
  },
];

const handlePlayerJoin = function (username, lobby, callback) {
  debug(`User: ${username}, Socket id: ${this.id} wants to join lobby`);

  // Använd array push() och splice() för att lägga till och ta bort spelare från lobbyn

  let player1;
  let player2;

  const room = rooms.find((room) => room.id === "lobby");

  // room.usernames[this.id] = username;

  room.usernames.push(username);

  // Kolla om det är två eller fler users i lobbyn
  if (_.size(room.usernames) >= 2) {
    console.log(_.size(room.usernames));

    player1 = room.usernames[0];
    player2 = room.usernames[1];

    // Starta ett spel
    startGame(player1, player2);

    room.usernames.splice(0, 2);
  } else {
    // Skicka till waiting-screen
    pendingScreen();
  }
};

const startGame = function (player1, player2) {
  /* 
  
  Skapa ett objekt som är ett rum där namnet genereras för varje gång två spelare matchar.

  Namnet ska genereras som exempelvis "gameroom" sen logik som lägger till en siffra för att namnet ska vara unikt. 

  Ta bort rummet efter avslutat spel

  */

  console.log(player1);
  console.log(player2);
};

const pendingScreen = function () {
  console.log("Waiting for opponent");
};

handlePlayerJoin();
