"use strict";
var GameEndState;
(function (GameEndState) {
    GameEndState[GameEndState["Win"] = 0] = "Win";
    GameEndState[GameEndState["Loss"] = 1] = "Loss";
    GameEndState[GameEndState["Tie"] = 2] = "Tie";
})(GameEndState || (GameEndState = {}));
var Direction;
(function (Direction) {
    Direction[Direction["North"] = 0] = "North";
    Direction[Direction["East"] = 1] = "East";
    Direction[Direction["Up"] = 2] = "Up";
    // NW <-> SE, NE <-> SW horizontal diagonals
    Direction[Direction["NorthWest"] = 3] = "NorthWest";
    Direction[Direction["NorthEast"] = 4] = "NorthEast";
    // Cube Diagonals. NWDiag = "NorthWestDiagonal"
    // NW is the direction of the arrow going
    // from the SE bottom corner of the cube to the top corner
    Direction[Direction["NWDiag"] = 5] = "NWDiag";
    Direction[Direction["NEDiag"] = 6] = "NEDiag";
    Direction[Direction["SEDiag"] = 7] = "SEDiag";
    Direction[Direction["SWDiag"] = 8] = "SWDiag";
})(Direction || (Direction = {}));
// The "Points" on the right correspond to the direction of the step
// i.e. To go up from [x,y,z], we add [0,0,1] (and subtract to go down)
var directionslist = [
    [Direction.Up, [0, 0, 1]],
    [Direction.North, [0, 1, 0]],
    [Direction.East, [1, 0, 0]],
    [Direction.NorthWest, [1, -1, 0]],
    [Direction.NorthEast, [1, 1, 0]],
    [Direction.NWDiag, [-1, 1, 1]],
    [Direction.NEDiag, [1, 1, 1]],
    [Direction.SEDiag, [1, -1, 1]],
    [Direction.SWDiag, [-1, -1, 1]],
];
var directions = new Map(directionslist);
function addXYZ(_a, _b) {
    var ax = _a[0], ay = _a[1], az = _a[2];
    var bx = _b[0], by = _b[1], bz = _b[2];
    var newpoint = [ax + bx, ay + by, az + bz];
    if (!validPoint(newpoint))
        throw new Error("Cannot add " + [ax, ay, az] + " and " + [ax, ay, az] + " = " + newpoint + ".\n      Coordinates must be between 0 and 3 inclusive.");
    return newpoint;
}
function multiplyXYZ(n, _a) {
    var x = _a[0], y = _a[1], z = _a[2];
    return [n * x, n * y, n * z];
}
function validPoint(p) {
    for (var _i = 0, p_1 = p; _i < p_1.length; _i++) {
        var x = p_1[_i];
        if (x < 0 || x > 3)
            return false;
    }
    return true;
}
function getLine(p, d) {
    var step = directions.get(d);
    if (step) {
        var points = [-2, -1, 1, 2].map(function (i) { return addXYZ(p, multiplyXYZ(i, step)); })
            .filter(function (newp) { return validPoint(newp); });
        points.push(p);
        return points;
    }
    throw new Error(d + " is not in the directions?!");
}
var Board = /** @class */ (function () {
    function Board() {
        var line = [0, 0, 0, 0];
        var layer = [line, line, line, line];
        this.tiles = [layer, layer, layer, layer];
    }
    Board.prototype.get = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        return this.tiles[x][y][z];
    };
    Board.prototype.set = function (p, _a) {
        var x = _a[0], y = _a[1], z = _a[2];
        this.tiles[x][y][z] = p.num;
    };
    return Board;
}());
var Player = /** @class */ (function () {
    function Player(getMove, num, name) {
        this.getMove = getMove;
        this.num = num;
        this.name = name;
        if (name == null) {
            this.name = "Player " + num;
        }
    }
    return Player;
}());
var Game = /** @class */ (function () {
    function Game(board, unset, currentPlayer, opponent) {
        this.board = board;
        this.unset = unset;
        this.currentPlayer = currentPlayer;
        this.opponent = opponent;
    }
    Game.prototype.makeMove = function (move) {
        if (this.board.get(move) != 0)
            throw new Error(this.currentPlayer.name + " tried to set already-set tile at " + move + "!");
        this.unset.delete(move);
        this.board.set(this.currentPlayer, move);
    };
    Game.prototype.wasWonBy = function (_a) {
        var _this = this;
        var x = _a[0], y = _a[1], z = _a[2];
        for (var _i = 0, _b = directions.keys(); _i < _b.length; _i++) {
            var d = _b[_i];
            var line = getLine([x, y, z], d);
            var inarow = line.filter(function (p) {
                return _this.board.get(p) == _this.currentPlayer.num;
            });
            if (inarow.length == 4)
                return true;
        }
        return false;
    };
    return Game;
}());
function tie(game) {
    console.log("Tied game.");
    return GameEndState.Tie;
}
function win(game) {
    console.log(game.currentPlayer.name + " has won the game!");
    return GameEndState.Tie;
}
function loop(game) {
    if (game.unset.size == 0)
        return [tie(game), game];
    var move = game.currentPlayer.getMove(game.board);
    game.makeMove(move);
    if (game.wasWonBy(move))
        return [win(game), game];
    return loop(game);
}
