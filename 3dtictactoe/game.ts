
type Tile = 0 | 1 | 2 // empty, player 1's, or player 2's tile
type Line = Tile[]
type Layer = Line[]
export type Coordinates = [number, number, number]

export class Point{
  x: number
  y: number
  z: number
  constructor([x,y,z]: Coordinates){
    this.x = x
    this.y = y
    this.z = z
  }

  static from(xyz: number[]){
    return new Point([xyz[0], xyz[1], xyz[2]])
  }

  manDist(p: Point){
    return this.add(p.multiply(-1)).xyz() // this - p
                .map(x => Math.abs(x)) // abs
                .reduce((prev, cur) => prev + cur, 0) // sum
  }

  xyz() {return [this.x,this.y,this.z]}

  add(p: Point): Point {
    return new Point([this.x+p.x, this.y+p.y, this.z+p.z])
  }
  
  multiply(n: number): Point {
    return new Point([n*this.x, n*this.y, n*this.z])
  }
  
  equals(p: Point) {
    return this.x == p.x && this.y == p.y && this.z == p.z
  }
  
  isValid(){
    for (var x of [this.x, this.y, this.z]) { 
      if (x < 0 || x > 3) return false 
    }
    return true
  }
}

export interface GameEndState { 
  tie: boolean
  winner: Player
  loser: Player
  winningLine: Point[]
} 

enum Direction {  // Horizontal Layer North, East, Vertical Up
                  North, East, Up, 
                  // NW <-> SE, NE <-> SW horizontal diagonals
                  NorthWest, NorthEast,
                  // Cube Diagonals. NWDiag = "NorthWestDiagonal"
                  // NW is the direction of the arrow going
                  // from the SE bottom corner of the cube to the top corner
                  NWDiag, NEDiag, SEDiag, SWDiag 
                }

// The "Points" on the right correspond to the direction of the step
// i.e. To go up from [x,y,z], we add [0,0,1] (and subtract to go down)
const directionslist: [Direction, Point][] = [
  [Direction.Up, new Point([0, 0, 1])],
  [Direction.North, new Point([0, 1, 0])],
  [Direction.East, new Point([1, 0, 0])],
  [Direction.NorthWest, new Point([1, -1, 0])],
  [Direction.NorthEast, new Point([1, 1, 0])],
  [Direction.NWDiag, new Point([-1, 1, 1])],
  [Direction.NEDiag, new Point([1, 1, 1])],
  [Direction.SEDiag, new Point([1, -1, 1])],
  [Direction.SWDiag, new Point([-1, -1, 1])],
]
const directions = new Map<Direction, Point>(directionslist)


export function getLine(p: Point, step: Point): Point[] {
  var points = [-3, -2, -1, 1, 2, 3].map(i => p.add(step.multiply(i)))
                          .filter(newp => newp.isValid())
  points.push(p)
  return points
}

export class Board {
  tiles : Layer[]
  constructor() {
    function line(): Line {return [0,0,0,0]}
    function layer(): Layer {return [line(), line(), line(), line()]}
    this.tiles = [layer(), layer(), layer(), layer()]
  }
  get(pt: Point): Tile {
    return this.getXYZ(pt.x,pt.y,pt.z)
  }
  getXYZ(x: number, y: number, z: number): Tile{
    return this.tiles[x][y][z]
  }
  set(p: Player, pt: Point): void {
    this.tiles[pt.x][pt.y][pt.z] = p.num
  }
  isFull(): Boolean {
    var zeroDoesntExist = true
    this.tiles.forEach(layer => 
      layer.forEach(line => 
        line.forEach(t => { 
          if (t == 0) zeroDoesntExist = false
        })))
    return zeroDoesntExist
  }
  getAllPoints(): Point[] {
    var points: Point[] = []
    for (var x of [0,1,2,3]){
      for (var y of [0,1,2,3]){
        for (var z of [0,1,2,3]){
          points.push(new Point([x,y,z]))
        }
      }
    }
    return points
  }
  getUnsetPoints(): Point[] {
    return this.getAllPoints().filter((p) => this.get(p) == 0)
  }
  print(): void {
    const horizontals = Array(65).fill("-").join("")
    process.stdout.write("\n")
    for (var y of [0,1,2,3]){
      process.stdout.write("[ ")
      for (var z of [0,1,2,3]){
        for (var x of [0,1,2,3]){
          process.stdout.write(this.getXYZ(x,y,z).toString())
          if (x < 3) process.stdout.write(" | ")
        }
        if (z < 3) process.stdout.write("  :  ")
      }
      process.stdout.write(" ]\n")
      if (y < 3) process.stdout.write(`${horizontals}\n`)
    }
    process.stdout.write("\n")
  }
}

export type GetMoveFunction = (b: Board, cb: ReadPointFunction) => void
export type ReadPointFunction = (x: Point) => void

export class Player {
  constructor(public getMove: GetMoveFunction, 
              public num: 1 | 2, public name?: string,
              public onGameEnd?: (s:GameEndState, g: Game) => void,) {
    if (name == null) {
      this.name = `Player ${num}` 
    } 
  }
}

export class Game {
  constructor(public currentPlayer: Player, 
              public opponent: Player,
              public board: Board = new Board()) { }

  makeMove(move: Point): Game {
    if (this.board.get(move) != 0) throw new Error(
      `${this.currentPlayer.name} tried to set already-set tile at ${move.xyz()}!`)
    this.board.set(this.currentPlayer, move)
    return this
  }

  wasWonBy(move: Point): [Boolean, Point[]] {
    var won = false
    var winningline: Point[] = []
    directions.forEach(step => {
      var line = getLine(move, step)
      var inarow = line.filter((p) => 
                              this.board.get(p) == this.currentPlayer.num)
      if (inarow.length == 4) {
        won = true
        winningline = inarow
      }
    })
    return [won, winningline]
  }

  swapPlayers(): Game {
    const previousPlayer = this.currentPlayer
    this.currentPlayer = this.opponent
    this.opponent = previousPlayer
    return this
  }
}

function tie(game: Game) {
  // console.log("Tied game.")
  return {
    tie: true,
    winner: game.currentPlayer,
    loser: game.opponent,
    winningLine: []
  }
}

function win(game: Game, winningLine: Point[]): GameEndState {
  // console.log(`${game.currentPlayer.name} has won the game!`)
  return {
    tie: false,
    winner: game.currentPlayer,
    loser: game.opponent,
    winningLine: winningLine
  }
}
type UpdateCallback = (g: Game) => void
type FinishedCallback = (s: GameEndState, g: Game) => void
export function loop(game: Game, 
                      updateCb: UpdateCallback,
                      finishedCb: FinishedCallback): void {
                        
  if (game.board.isFull()) finishedCb(tie(game), game)

  game.currentPlayer.getMove(game.board, 
    (move) => {

      if (!move.isValid()) {
        console.log(`${move.xyz()} is not a valid move!`)
        loop(game, updateCb, finishedCb)
      } else {

        game.makeMove(move)
        updateCb(game)

        var [won, line] = game.wasWonBy(move)
        if (won) {
          finishedCb(win(game, line), game)
        }

        else {
          game.swapPlayers()
          loop(game, updateCb, finishedCb)
        }
      }
    })
}
