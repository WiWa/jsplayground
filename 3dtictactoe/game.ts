
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

  add({x,y,z}: Point): Point {
    return new Point([this.x+x, this.y+y, this.z+z])
  }
  
  multiply(n: number): Point {
    return new Point([n*this.x, n*this.y, n*this.z])
  }
  
  equals({x,y,z}: Point) {
    return this.x == x && this.y == y && this.z == z
  }
  
  isValid(){
    for (var x of [this.x, this.y, this.z]) { 
      if (x < 0 || x > 3) return false 
    }
    return true
  }
}

export enum GameEndState { Win, Loss, Tie } 

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
    const line: Line = [0,0,0,0]
    const layer: Layer = [line, line, line, line]
    this.tiles = [layer, layer, layer, layer]
  }
  get({x,y,z}: Point) {
    return this.tiles[x][y][z]
  }
  set(p: Player, {x,y,z}: Point) {
    this.tiles[x][y][z] = p.num
  }
}

export class Player {
  constructor(public getMove: (b: Board) => Point, 
              public num: 1 | 2, public name?: string) {
    if (name == null) {
      this.name = `Player ${num}` 
    } 
  }
}

export class Game {
  constructor(public board: Board, 
              public unset: Set<Point>, 
              public currentPlayer: Player, 
              public opponent: Player) { }

  makeMove(move: Point): Game {
    if (this.board.get(move) != 0) throw new Error(
      `${this.currentPlayer.name} tried to set already-set tile at ${move}!`)
    this.unset.delete(move)
    this.board.set(this.currentPlayer, move)
    return this
  }

  wasWonBy(move: Point): Boolean {
    directions.forEach(step => {
      var line = getLine(move, step)
      var inarow = line.filter((p) => 
                              this.board.get(p) == this.currentPlayer.num)
      if (inarow.length == 4) return true
    })
    return false
  }

  swapPlayers(): Game {
    const previousPlayer = this.currentPlayer
    this.opponent = previousPlayer
    this.currentPlayer = this.opponent
    return this
  }
}

function tie(game: Game) {
  console.log("Tied game.")
  return GameEndState.Tie
}

function win(game: Game) {
  console.log(`${game.currentPlayer.name} has won the game!`)
  return GameEndState.Tie
}

export function loop(game: Game): [GameEndState, Game] {
  if (game.unset.size == 0) return [tie(game), game]
  const move: Point = game.currentPlayer.getMove(game.board)
  game.makeMove(move)
  if (game.wasWonBy(move)) return [win(game), game]
  return loop(game.swapPlayers())
}
