/*
*   Socket Controller
*/

const debug = require('debug')('game:socket_controller');

let io = null;

const users = {};
const rooms = {};

const handlePlayerJoin = function(username, callback) {
    
}