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

let timeBegan = null,
  timeStopped = null,
  stoppedDuration = 0,
  started = null;

function start() {
  if (timeBegan === null) {
    timeBegan = new Date();
  }

  if (timeStopped !== null) {
    stoppedDuration += new Date() - timeStopped;
  }

  started = setInterval(clockRunning, 10);
}

function stop() {
  timeStopped = new Date();
  clearInterval(started);
}

function reset() {
  clearInterval(started);
  stoppedDuration = 0;
  timeBegan = null;
  timeStopped = null;
  document.querySelector("#timer").innerHTML = "00.000";
}

function clockRunning() {
  let currentTime = new Date(),
    timeElapsed = new Date(currentTime - timeBegan - stoppedDuration),
    mins = timeElapsed.getUTCMinutes(),
    sec = timeElapsed.getUTCSeconds(),
    ms = timeElapsed.getUTCMilliseconds();

  if (undefined) {
    return "Loading";
  }

  document.querySelector("#timer").innerHTML =
    (mins > 0 ? mins : "0") +
    "." +
    (sec > 9 ? sec : "0" + sec) +
    "." +
    (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);
}

if (document.querySelector("#timer").innerHTML === undefined) {
  document.querySelector("#timer").innerHTML = "LOADING :)";
}

let virus = document.querySelector("#virus");
let gameRoomId;

/* Hämtar alla de olika skärmarna vi använder */
let firstScreen = document.querySelector(".first-screen");
let secondScreen = document.querySelector(".second-screen");
let gameScreen = document.querySelector(".game-screen");

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
  //Mapping the usernames objects and returns the names
  let mappedUsernames = Object.values(usernames).map(
    (username) => username.name
  );

  //Filters out the opponents username
  let opponentUsername = mappedUsernames.filter(
    (opponent) => opponent !== username
  );

  //Sets the players name as the first name which is in white
  document.querySelector("#your-name").innerHTML = username;

  //Sets the opponents name as the second name which is in red
  document.querySelector("#opponent-name").innerHTML = opponentUsername;

  if (Object.keys(usernames).length == 2) {
    secondScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gamePlay();
  }
};

// Lyssna, på "player:list" efter uppdateringar på antalet användare från socket_controller.
socket.on("players:list", (usernames) => {
  console.log("Vidare");

  updatePlayerList(usernames);
  // Den här visar att usernames skickar med hela arrayen, alltså båda spelarnas username och socket id. Men bara när den andra spelaren ansulet.
});

let yourPoints = 0;
let opponentPoints = 0;
let yourTime;
let opponentTime;

socket.on("player:point", (playerid, gameRoomId) => {
  const turn = gameRoomId.turn;
  const { name, time } = gameRoomId.usernames[playerid];

  gameRoomId = turn;
});

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
socket.on("virus:position", (randomGrid, currentRoom) => {
  // Assign the object to the virus so it moves around on every click
  Object.assign(virus.style, currentRoom);

  console.log(currentRoom);
  // console.log(currentRoom.position);

  // Start the clock
  reset();
  start();
  createdTime = Date.now();
  // Show virus
  virus.style.visibility = "visible";
});

const virusClick = virus.addEventListener("click", () => {
  virus.style.visibility = "hidden";
  // Get the clock after click
  clickedTime = Date.now();
  stop();

  // Get the time in milliseconds
  reactionTime = (clickedTime - createdTime) / 1000;
  /*   let yourTime = (clickedTime - createdTime) / 1000; */

  socket.emit("user:virusclick", reactionTime, gameRoomId, (data) => {
    updatePoints(data);
  });
});

socket.on("round:win", (playerID, roundWinner, opponentId, currentRoom) => {
  const players = currentRoom.usernames;
  const thisPlayer = players[playerID];
  const opponent = players[opponentId];

  document.querySelector("#your-name").innerHTML = thisPlayer["name"];
  document.querySelector("#opponent-name").innerHTML = opponent["name"];

  document.querySelector(".your-points").innerHTML = thisPlayer["points"];
  document.querySelector(".opponent-points").innerHTML = opponent["points"];

  document.querySelector("#timer").innerHTML = clockRunning();
  document.querySelector("#your-time").innerHTML = thisPlayer["time"];
  document.querySelector("#opponent-time").innerHTML = opponent["time"];

  if (currentRoom.clicks.length === 2) {
    if (document.querySelector("#timer").innerHTML === "undefined") {
      document.querySelector("#timer").innerHTML = "Waiting…";
    }
    socket.emit("game:new");
  } else {
    console.log("väntar på motståndare");
  }
});

socket.on("game:over", (player1, player2) => {
  console.log("GAME OVER");
  console.log(player1);
  console.log(player2);
  let theWinner;
  let theWinnerPoints;
  if (parseInt(player1["points"]) > parseInt(player2["points"])) {
    theWinner = player1["name"];
    theWinnerPoints = player1["points"];
  } else {
    theWinner = player2["name"];
    theWinnerPoints = player2["points"];
  }

  let gameOverDiv = document.createElement("div");
  gameOverDiv.className = "game-over-div";
  let gameOverWinnerName = document.createElement("p");
  gameOverWinnerName.innerHTML = "The winner is: " + theWinner;
  let gameOverWinnerPoints = document.createElement("p");
  gameOverWinnerPoints.innerHTML = "Points: " + theWinnerPoints;
  let gameOverButton = document.createElement("button");
  gameOverButton.innerHTML = "New game";
  gameOverDiv.appendChild(gameOverWinnerName);
  gameOverDiv.appendChild(gameOverWinnerPoints);
  gameOverDiv.appendChild(gameOverButton);
  document.querySelector("body").appendChild(gameOverDiv);
  gameOverButton.addEventListener("click", () => {
    window.location.reload();
  });
});

//  Gör mer dynamiskt istället för repetition
socket.on("player:disconnected", (usernames) => {
  console.log(usernames);

  let gameOverDiv = document.createElement("div");
  gameOverDiv.className = "game-over-div";
  let gameOverWinnerName = document.createElement("p");
  gameOverWinnerName.innerHTML = "Your opponent left *sad face*";
  let gameOverButton = document.createElement("button");
  gameOverButton.innerHTML = "New game";
  gameOverDiv.appendChild(gameOverWinnerName);
  // gameOverDiv.appendChild(gameOverWinnerPoints);
  gameOverDiv.appendChild(gameOverButton);
  document.querySelector("body").appendChild(gameOverDiv);
  gameOverButton.addEventListener("click", () => {
    window.location.reload();
  });
});
