"use strict"

let cursorImages = ["Handsprit.png", "Handsprit@2x", "Handsprit@3x"];
let virus = document.querySelector('#virus');
let randomGridNumberX = Math.floor(Math.random() * 11);
let randomGridNumberY = Math.floor(Math.random() * 11);
let rounds = 10;

let randomGrid = {
    gridColumnStart: randomGridNumberX,
    gridColumnEnd: ++randomGridNumberX,
    gridRowStart: randomGridNumberY,
    gridRowEnd: ++randomGridNumberY
};

Object.assign(virus.style, randomGrid);

virus.addEventListener('click', () => {
    console.log('hej')
})
