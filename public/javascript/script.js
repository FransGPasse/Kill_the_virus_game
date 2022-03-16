"use strict";

let cursorImages = ["Handsprit.png", "Handsprit@2x", "Handsprit@3x"];
let virus = document.querySelector("#virus");
let rounds = 10;
let clickedTime;
let createdTime;
let reactionTime;

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
