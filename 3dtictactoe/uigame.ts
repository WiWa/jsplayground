
// https://stackoverflow.com/questions/9140101/creating-a-clickable-grid-in-a-web-browser

// Can't use imports for some reason in a static html...
// import {Game, loop, Board, GameEndState} from './game'
// import {humanUIPlayer, randomPlayer} from './players'
// Time to literally copy-paste

// Game

type Tile = 0 | 1 | 2 // empty, player 1's, or player 2's tile
type Line = Tile[]
type Layer = Line[]

class Point{
  x: number
  y: number
  z: number
  constructor([x,y,z]: [number, number, number]){
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

interface GameEndState { 
  tie: boolean
  winner: Player
  loser: Player
  winningLine: Point[]
} 

enum Direction {  // Horizontal Layer North, East, Vertical Up
                  North, East, Up, 
                  // NW <-> SE, NE <-> SW horizontal diagonals
                  NorthWest, NorthEast,
                  // North and Up at the same time, etc. (vertical diagonals)
                  NorthUp, SouthUp, WestUp, EastUp,
                  // Cube Diagonals. NWDiag = "NorthWestDiagonal"
                  // NW is the direction of the arrow going
                  // from the SE bottom corner of the cube to the top corner
                  NWDiag, NEDiag, SEDiag, SWDiag 
                }

// The "Points" on the right correspond to the direction of the step
// i.e. To go up from [x,y,z], we add [0,0,1] (and subtract to go down)
const directionslist: [Direction, Point][] = [
  [Direction.Up, Point.from([0, 0, 1])],
  [Direction.North, Point.from([0, 1, 0])],
  [Direction.East, Point.from([1, 0, 0])],
  [Direction.NorthWest, Point.from([1, -1, 0])],
  [Direction.NorthEast, Point.from([1, 1, 0])],
  [Direction.NorthUp, Point.from([0, 1, 1])],
  [Direction.SouthUp, Point.from([0, -1, 1])],
  [Direction.WestUp, Point.from([-1, 0, 1])],
  [Direction.EastUp, Point.from([1, 0, 1])],
  [Direction.NWDiag, Point.from([-1, 1, 1])],
  [Direction.NEDiag, Point.from([1, 1, 1])],
  [Direction.SEDiag, Point.from([1, -1, 1])],
  [Direction.SWDiag, Point.from([-1, -1, 1])],
]
const directions = new Map<Direction, Point>(directionslist)


 function getLine(p: Point, step: Point): Point[] {
  var points = [-3, -2, -1, 1, 2, 3].map(i => p.add(step.multiply(i)))
                          .filter(newp => newp.isValid())
  points.push(p)
  return points
}

 class Board {
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
    return this.getUnsetPoints().length == 0
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
    console.log()
    for (var x of [0,1,2,3]){
      var line = ""
      line += ("[ ")
      for (var z of [0,1,2,3]){
        for (var y of [0,1,2,3]){
          line += (this.getXYZ(x,y,z).toString())
          if (y < 3) line += (" | ")
        }
        if (z < 3) line += ("  :  ")
      }
      line += (" ]\n")
      if (x < 3) line += (`${horizontals}`)
      console.log(line)
    }
    console.log()
  }
}

 type GetMoveFunction = (b: Board, cb: ReadPointFunction) => void
 type ReadPointFunction = (x: Point) => void

 class Player {
  constructor(public getMove: GetMoveFunction, 
              public num: 1 | 2, public name?: string,
              public onGameEnd?: (s:GameEndState, g: Game) => void,) {
    if (name == null) {
      this.name = `Player ${num}` 
    } 
  }
}

 class Game {
  constructor(public currentPlayer: Player, 
              public opponent: Player,
              public board: Board = new Board()) { }

  makeMove(move: Point): Game {
    if (this.board.get(move) != 0) throw new Error(
      `${this.currentPlayer.name} tried to set already-set tile at ${move.xyz()}!`)
    console.log(`${this.currentPlayer.name} sets ${move.xyz()} to ${this.currentPlayer.num}.`)
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
 function loop(game: Game, 
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

// Players

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

 function humanUIPlayer(window: Window, 
                              num: 1 | 2, name?: string): Player {
  function getMoveFromUI(b: Board, inputCallback: ReadPointFunction): void {
    const handler = (event: CustomEventInit) => {
      const p = event.detail
      const point = new Point([p.x, p.y, p.z])
      window.removeEventListener('tile-click', handler)
      if (point.isValid() && b.get(point) == 0) {
        inputCallback(point)
      } else {
        alert("Invalid Move!")
        getMoveFromUI(b, inputCallback)
      }
    }
    window.addEventListener('tile-click', handler)
  }
  return new Player(getMoveFromUI, num, name)
}

function getRandomInt(min: number, max:number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

 function randomPlayer(num: 1 | 2, name?: string): Player {
  function getMove(b: Board, inputCallback: ReadPointFunction): void {
    const unset = b.getUnsetPoints()
    inputCallback( unset[getRandomInt(0, unset.length)] )
  }
  return new Player(getMove, num, name)
}

// Actual "uigame.ts"

type EventListenerCallback = (el: HTMLElement, 
                              row: number, col: number, i: number) => void

function clickableGrid(rows: number, cols: number, 
                        callback: EventListenerCallback){
  var i=0;
  var grid = document.createElement('table');
  grid.className = 'grid';
  for (var r=0;r<rows;++r){
    var tr = grid.appendChild(document.createElement('tr'));
    for (var c=0;c<cols;++c){
      var cell = tr.appendChild(document.createElement('td'));
      // cell.innerHTML = (++i).toString();
      cell.addEventListener('click',(function(el,r,c,i){
        return function(){ callback(el,r,c,i); }
       })(cell,r,c,i),false);
    }
  }
  return grid;
}

const boardDiv = document.createElement('div');
boardDiv.id = "boardDiv";
document.body.appendChild(boardDiv);

[0,1,2,3].forEach((z) => {
  var grid = clickableGrid(4,4,function(el,row,col,i){
    console.log(`(x,y,z) = (${row+1},${col+1},${z+1})`)
    var event = new CustomEvent('tile-click', { detail: {
      x: row, y: col, z: z}
    });
    window.dispatchEvent(event);
  });
  var gridDiv = document.createElement('div');
  gridDiv.className = `gridDiv layer-${z}`
  gridDiv.appendChild(grid)

  var gridLabel = document.createElement('p')
  gridLabel.className = "grid-label"
  gridLabel.innerHTML = `Layer ${z+1}`
  gridDiv.appendChild(gridLabel)

  boardDiv.appendChild(gridDiv);
})


const player1 = humanUIPlayer(window, 1)
const player2 = randomPlayer(2)

loop(new Game(player1, player2), 
      (g: Game) => {
        // g.board.print()

      }, 
      (s: GameEndState, g: Game) => {
        g.board.print()
        if (player1.onGameEnd) player1.onGameEnd(s, g)
        if (player2.onGameEnd) player2.onGameEnd(s ,g)
      })