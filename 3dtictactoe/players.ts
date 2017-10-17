
import {Game, Player, loop, Point, Board, ReadPointFunction} from './game'
import * as readline from 'readline'

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {
  console.log(line.length);
});

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

export function humanTerminalPlayer(num: 1 | 2, name?: string): Player {
  
  function getMoveFromTerminal(b: Board, inputCallback: ReadPointFunction): void {
    console.log("Enter Move, format 'x,y,z' without quotes:")
    rl.on('line', function (line: string) {
      const inputCoordinates: number[] = line.split(',')
                                    .map(s => s.trim())
                                    .filter(s => isPositiveInteger(s))
                                    .map(s => Number(s))
      if (inputCoordinates.length != 3) {
        console.log(`Input is wrong: ${line}`)
      } else {
        let [x,y,z] = inputCoordinates
        inputCallback(new Point([x,y,z]))
        rl.close()
      }
    })
  }
  return new Player(getMoveFromTerminal, num, name)
}