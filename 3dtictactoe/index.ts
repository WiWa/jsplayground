
import {Game, Player, loop, Point, Board} from './game'

const fs = require('fs');
const MAX_LINE_DATA = 1024 * 1024; // 1 MB per line

// instream should be a Readable Stream
var getline = function(instream){
  instream.resume();
  var input_size = fs.readSync(instream.fd, MAX_LINE_DATA, 0, "utf8");
  instream.pause();
  return input_size[0].trim();
}

var getlinestd = function(){
  return getline(process.stdin);
}

function isPositiveInteger(str) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

function getMoveFromTerminal(b: Board): Point {
  console.log("Enter Move, format 'x,y,z' without quotes:")
  const input = getlinestd()
  const inputCoordinates = input.split(',')
                                .map(s => s.trim())
                                .filter(s => isPositiveInteger(s))
                                .map(s => Number(s))
  if (inputCoordinates.length != 3) {
    console.log(`Input is wrong: ${input}`)
    return getMoveFromTerminal(b)
  }
  return new Point(inputCoordinates)
}

const human1 = new Player(getMoveFromTerminal, 1) 
const human2 = new Player(getMoveFromTerminal, 2)

console.log(loop(new Game(human1, human2)))