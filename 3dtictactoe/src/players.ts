
import { Game, Player, loop, Point, Board, ReadPointFunction, Tile} from './game'
import {runminimax} from './minimax'
import ObsLite from './obslite'
import * as readline from 'readline'

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

export function humanTerminalPlayer(rl: readline.ReadLine, num: 1 | 2, name?: string): Player {
  const query = "Enter Move, format 'x,y,z' without quotes:"
  function getMoveFromTerminal(g: Game, inputCallback: ReadPointFunction): void {
    rl.question(query, function(line: string) {
      const inputCoordinates: number[] = line.split(',')
        .map(s => s.trim())
        .filter(s => isPositiveInteger(s))
        .map(s => Number(s))
      if (inputCoordinates.length != 3) {
        console.log(`Input is wrong: ${line}`)
        getMoveFromTerminal(g, inputCallback)
      } else {
        console.log(`Setting ${inputCoordinates} to ${num}`)
        inputCallback(Point.from(inputCoordinates))
      }
    })
  }
  return new Player(getMoveFromTerminal, num, name)
}

export function humanUIPlayer(tileClickObs: ObsLite<Point>,
  num: 1 | 2, name?: string): Player {
  function getMoveFromUI(g: Game, inputCallback: ReadPointFunction): void {
    tileClickObs.subscribeOnce((point) => inputCallback(point))
  }
  return new Player(getMoveFromUI, num, name)
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function randomPlayer(num: 1 | 2, name?: string): Player {
  function getMove(g: Game, inputCallback: ReadPointFunction): void {
    const unset = g.board.getUnsetPoints()
    inputCallback(unset[getRandomInt(0, unset.length)])
  }
  return new Player(getMove, num, name)
}


export function minimaxPlayer(num: 1 | 2, depth: number = 1,
                              drunkenness: number = 0,
                              name?: string): Player {
  const fallback: Player = randomPlayer(num, name)

  function toTiles(b:Board, line: Point[]): Tile[] {
    return line.map((p) => b.get(p))
  }

  function heuristic(g: Game): number {
    if (g.done){
      if (g.winningPlayer == null) return 0
      if (g.winningPlayer.num != num) return Number.MAX_SAFE_INTEGER // we won; '!=' is because we swapped players 
      return Number.MIN_SAFE_INTEGER
    }

    const winningLines = g.board.getAllWinnableLines()

    var score = 0
    winningLines.forEach((line) => {
      var tiles = toTiles(g.board, line)
      var unsetTiles = tiles.filter((t) => t == 0).length
      var myTiles = tiles.filter((t) => t == num).length
      var oppTiles = 4 - myTiles - unsetTiles

      // bad score only if I didn't block opponent
      // prioritize lines with more opponent tiles 
      if (oppTiles > 0){
        if (myTiles == 0){
          score -= Math.pow(100, oppTiles)
        }
      }
      else {
        score += Math.pow(90, myTiles)
      }
    })
    
    return score
  }

  function possibleMoves(g: Game) {
    return g.board.getUnsetPoints()
  }
  function isDone(g: Game) {
    return g.done
  }
  function getMove(g: Game, inputCallback: ReadPointFunction): void {
    if (Math.random() < drunkenness) {
      fallback.getMove(g, inputCallback)
      return
    }
    const [action, value] = runminimax(g, possibleMoves, isDone, 
                                        heuristic, depth, true)
    if (action != null) inputCallback(action)
    else {
      fallback.getMove(g, inputCallback)
    }
  }
  return new Player(getMove, num, name)
}