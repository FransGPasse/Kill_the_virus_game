"use strict";

/*
 *   Server-to-front-end functions (( ARBETSTITEL ))
 *
 */

const socket = io();

let username = null;

socket.on("user:connected", (username) => {
  console.log("Lyssnar på user:connected");
});

/*
 *   Game functions
 *
 */

let virus = document.querySelector("#virus");
let gameRoomId;

/* Hämtar alla de olika skärmarna vi använder */
let firstScreen = document.querySelector(".first-screen");
let secondScreen = document.querySelector(".second-screen");
let gameScreen = document.querySelector("#game");

/* Hämtar knappen där man skriver in lösenord */
let submitUsername = document.querySelector("#submit-username");

let rounds = 10;
let clickedTime;
let createdTime;
let reactionTime;
let count = 3;

const searchForGame = () => {
  firstScreen.classList.toggle("hidden");
  secondScreen.classList.toggle("hidden");
};

submitUsername.addEventListener("submit", (e) => {
  e.preventDefault();

  searchForGame();

  username = submitUsername.username.value;

  let welcomeUser = document.querySelector("#welcome-user");

  welcomeUser.innerHTML = "Welcome, " + username;

  socket.emit("user:joined", username, (gameRoom) => {
    gameRoomId = gameRoom;
  });
});

const updatePlayerList = (usernames) => {
  // console.log(usernames);

  document.querySelector("#opponent-score").innerHTML = Object.values(usernames)
    .map(
      (username) => `<li>
       ${username.name}</li>`
    )
    .join("");

  if (Object.keys(usernames).length == 2) {
    secondScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gamePlay();
  }
};

// Lyssna, på "player:list" efter uppdateringar på antalet användare från socket_controller.
socket.on("players:list", (usernames) => {
  console.log("Vidare");

  // console.log(usernames);
  updatePlayerList(usernames);
  // Den här visar att usernames skickar med hela arrayen, alltså båda spelarnas username och socket id. Men bara när den andra spelaren ansulet.
});

/*
  - Kolla updateUserList på johans kod och jämför => genom den funktionen, trigga spelmekaninen
*/

// COUNTDOWN FUNCTION
// function endCountdown() {
//   console.log("starting the game now");
// }

// function handleTimer() {
//   if (count === -1) {
//     clearInterval(timer);
//     endCountdown();
//   } else {
//     document.querySelector(".countdown").innerHTML = count;
//     count--;
//   }
// }

// var timer = setInterval(function () {
//   handleTimer(count);
// }, 1000);
// COUNTDOWN FUNCTION

let yourPoints = 0;
let opponentPoints = 0;
let yourTime;
let opponentTime;

socket.on('player:point', (playerid, gameRoomId) => {
  const turn = gameRoomId.turn;
  const { name, time } = gameRoomId.usernames[playerid]

  gameRoomId = turn;
})


const pointHandler = (yourTime) => {
  // console.log(yourTime);
  // if (yourTime > 0.5) {
  //   ++yourPoints;
  //   document.querySelector(".your-points").innerHTML = yourPoints;
  // } else {
  //   ++opponentPoints;
  //   document.querySelector(".enemy-points").innerHTML = opponentPoints;
  // }


};

// Check if the cursor has been cliked, if so we run the function below
document.onclick = () => applyCursorRippleEffect(event);

// Functon to get the cursor effect on click
function applyCursorRippleEffect(e) {
  // Create a document for the effect
  const ripple = document.createElement("div");
  // Add the classname to the div
  ripple.className = "ripple";
  // Append the div to the body
  document.body.appendChild(ripple);
  // Get position of the cursor
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  // Add the animation
  ripple.style.animation = "ripple-effect .4s  linear";
  // Remove animation
  ripple.onanimationend = () => document.body.removeChild(ripple);
}

// Function to generate new position for the virus
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
  // console.log(randomGrid);

  // Assign the object to the virus so it moves around on every click
  Object.assign(virus.style, randomGrid);

  // Start the clock
  createdTime = Date.now();
};

const gamePlay = () => {
  generateNewPosition();

  const virusClick = virus.addEventListener("click", () => {
    // Get the clock after click
    clickedTime = Date.now();

    // Get the time in milliseconds
    reactionTime = (clickedTime - createdTime) / 1000;
    let yourTime = (clickedTime - createdTime) / 1000;

    document.querySelector("#your-score").innerHTML = reactionTime;
    virus.style.visibility = "hidden";

    // pointHandler(yourTime);
    // generateNewPosition();

    socket.emit("user:virusclick", reactionTime, gameRoomId, (data) => {
      updatePoints(data);
    });

    let delay = Math.floor(Math.random() * 5);

    setTimeout(() => {
      generateNewPosition();
      virus.style.visibility = "visible";
    }, parseInt(delay * 1000));
    generateNewPosition();

    // socket.emit("user:virusclick", reactionTime, gameRoomId, (data) => {
    //   updatePoints(data);
    // });
  });
};

socket.on('player:win', (username, roundWinner, opponentId, currentRoom) => {
  console.log('hit');
  const players = currentRoom.usernames;
  const thisPlayer = players[username];
  // const playerWinner = players[roundWinner];
  const opponent = players[opponentId];

  console.log('This player:'. thisPlayer);
  console.log('Opponent:', opponent);

  document.querySelector(".your-points").innerHTML = thisPlayer.points;

  document.querySelector(".enemy-points").innerHTML = opponent.points;

  if (currentRoom.turn < 10) {
    gamePlay();
  }
});