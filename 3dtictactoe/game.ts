
type Tile = 0 | 1 | 2 // empty, player 1's, or player 2's tile
type Line = Tile[]
type Layer = Line[]
type Point = [number, number, number]

enum GameEndState { Win, Loss, Tie } 

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
  [Direction.Up, [0, 0, 1]],
  [Direction.North, [0, 1, 0]],
  [Direction.East, [1, 0, 0]],
  [Direction.NorthWest, [1, -1, 0]],
  [Direction.NorthEast, [1, 1, 0]],
  [Direction.NWDiag, [-1, 1, 1]],
  [Direction.NEDiag, [1, 1, 1]],
  [Direction.SEDiag, [1, -1, 1]],
  [Direction.SWDiag, [-1, -1, 1]],
]
const directions = new Map<Direction, Point>(directionslist)

function addXYZ([ax,ay,az]: Point, [bx,by,bz]: Point): Point {
  const newpoint: Point = [ax+bx, ay+by, az+bz]
  if(!validPoint(newpoint)) throw new Error(
    `Cannot add ${[ax,ay,az]} and ${[ax,ay,az]} = ${newpoint}.
      Coordinates must be between 0 and 3 inclusive.`
  )
  return newpoint
}

function multiplyXYZ(n: number, [x,y,z]: Point): Point {
  return [n*x, n*y, n*z]
}

function validPoint(p: Point){
  for (var x of p) { if (x < 0 || x > 3) return false }
  return true
}

function getLine(p: Point, step: Point): Point[] {
  var points = [-2,-1,1,2].map(i => addXYZ(p, multiplyXYZ(i, step)))
                          .filter(newp => validPoint(newp))
  points.push(p)
  return points
}

class Board {
  tiles : Layer[]
  constructor() {
    const line: Line = [0,0,0,0]
    const layer: Layer = [line, line, line, line]
    this.tiles = [layer, layer, layer, layer]
  }
  get([x,y,z]: Point) {
    return this.tiles[x][y][z]
  }
  set(p: Player, [x,y,z]: Point) {
    this.tiles[x][y][z] = p.num
  }
}

class Player {
  constructor(public getMove: (b: Board) => Point, 
              public num: 1 | 2, public name?: string) {
    if (name == null) {
      this.name = `Player ${num}` 
    } 
  }
}

class Game {
  constructor(public board: Board, 
              public unset: Set<Point>, 
              public currentPlayer: Player, 
              public opponent: Player) { }

  makeMove(move: Point): void {
    if (this.board.get(move) != 0) throw new Error(
      `${this.currentPlayer.name} tried to set already-set tile at ${move}!`)
    this.unset.delete(move)
    this.board.set(this.currentPlayer, move)
  }

  wasWonBy([x,y,z]: Point): Boolean {
    directions.forEach(step => {
      var line = getLine([x,y,z], step)
      var inarow = line.filter((p) => 
                              this.board.get(p) == this.currentPlayer.num)
      if (inarow.length == 4) return true
    })
    return false
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

function loop(game: Game): [GameEndState, Game] {
  if (game.unset.size == 0) return [tie(game), game]
  const move: Point = game.currentPlayer.getMove(game.board)
  game.makeMove(move)
  if (game.wasWonBy(move)) return [win(game), game]
  return loop(game)
}
