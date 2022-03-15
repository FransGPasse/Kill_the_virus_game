"use strict";

let cursorImages = ["Handsprit.png", "Handsprit@2x", "Handsprit@3x"];
let virus = document.querySelector("#virus");
let rounds = 10;

virus.addEventListener("click", () => {
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

  //   showVirus();
};
