
import { Game, Player, loop, Point, Board, ReadPointFunction } from './game'
import * as readline from 'readline'

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

export function humanTerminalPlayer(rl: readline.ReadLine, num: 1 | 2, name?: string): Player {
  const query = "Enter Move, format 'x,y,z' without quotes:"
  function getMoveFromTerminal(b: Board, inputCallback: ReadPointFunction): void {
    rl.question(query, function(line: string) {
      const inputCoordinates: number[] = line.split(',')
        .map(s => s.trim())
        .filter(s => isPositiveInteger(s))
        .map(s => Number(s))
      if (inputCoordinates.length != 3) {
        console.log(`Input is wrong: ${line}`)
        getMoveFromTerminal(b, inputCallback)
      } else {
        console.log(`Setting ${inputCoordinates} to ${num}`)
        inputCallback(Point.from(inputCoordinates))
      }
    })
  }
  return new Player(getMoveFromTerminal, num, name)
}

export function humanUIPlayer(window: Window,
  num: 1 | 2, name?: string): Player {
  function getMoveFromUI(b: Board, inputCallback: ReadPointFunction): void {
    window.addEventListener('tile-click', (event: CustomEventInit) => {
      const p = event.detail
      inputCallback(new Point([p.x, p.y, p.z]))
    })
  }
  return new Player(getMoveFromUI, num, name)
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function randomPlayer(num: 1 | 2, name?: string): Player {
  function getMove(b: Board, inputCallback: ReadPointFunction): void {
    const unset = b.getUnsetPoints()
    inputCallback(unset[getRandomInt(0, unset.length)])
  }
  return new Player(getMove, num, name)
}