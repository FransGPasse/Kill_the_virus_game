"use strict";


/*
*   Server-to-front-end functions (( ARBETSTITEL ))
*
*/
const socket = io();


socket.on("user:connected", (username) => {
  return username;
})




/*
*   Game functions
*
*/

let cursorImages = ["Handsprit.png", "Handsprit@2x", "Handsprit@3x"];
let virus = document.querySelector("#virus");
let rounds = 10;
let clickedTime;
let createdTime;
let reactionTime;

virus.addEventListener("click", () => {
  // Get the clock after click
  clickedTime = Date.now();
  // Get the time in milliseconds
  reactionTime = (clickedTime - createdTime) / 1000;
  document.querySelector("#your-score").innerHTML = reactionTime + "s";
  virus.style.visibility = "hidden";
  let delay = Math.floor(Math.random() * 5);
  setTimeout(() => {
    generateNewPosition();
    virus.style.visibility = "visible";
  }, parseInt(delay * 1000));
});

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
  console.log(randomGrid);

  // Assign the object to the virus so it moves around on every click
  Object.assign(virus.style, randomGrid);

  // Start the clock
  createdTime = Date.now();
};
