
import {Game, Player, loop, Point, Board, ReadPointFunction} from './game'
import * as readline from 'readline'

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

export function humanTerminalPlayer(num: 1 | 2, name?: string): Player {

  const query = "Enter Move, format 'x,y,z' without quotes:"
  function getMoveFromTerminal(b: Board, inputCallback: ReadPointFunction): void {
    rl.question(query, function (line: string) {
      const inputCoordinates: number[] = line.split(',')
                                    .map(s => s.trim())
                                    .filter(s => isPositiveInteger(s))
                                    .map(s => Number(s))
      if (inputCoordinates.length != 3) {
        console.log(`Input is wrong: ${line}`)
        console.log(`Try again:`)
        getMoveFromTerminal(b, inputCallback)
      } else {
        console.log("wtf")
        inputCallback(Point.from(inputCoordinates))
      }
    })
  }
  return new Player(getMoveFromTerminal, num, name)
}