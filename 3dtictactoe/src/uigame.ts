
// https://stackoverflow.com/questions/9140101/creating-a-clickable-grid-in-a-web-browser

import {Player, Game, loop, ReadPointFunction, Board, Point, GameEndState, Tile } from './game'
import {humanUIPlayer, randomPlayer} from './players'
import {runminimax} from './minimax'


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
    if (action != null) {
      inputCallback(action)
    }
    else {
      fallback.getMove(g, inputCallback)
    }
  }
  return new Player(getMove, num, name)
}

type EventListenerCallback = (el: HTMLElement,
  row: number, col: number, i: number) => void

function clickableGrid(rows: number, cols: number,
  callback: EventListenerCallback) {
  var i = 0;
  var grid = document.createElement('table');
  grid.className = 'grid';
  for (var r = 0; r < rows; ++r) {
    var tr = grid.appendChild(document.createElement('tr'));
    for (var c = 0; c < cols; ++c) {
      var cell = tr.appendChild(document.createElement('td'));
      // cell.innerHTML = (++i).toString();
      cell.className = `cell-${r}-${c}`
      cell.addEventListener('click', (function(el, r, c, i) {
        return function() { callback(el, r, c, i); }
      })(cell, r, c, i), false);
    }
  }
  return grid;
}

const boardDiv = document.createElement('div');
boardDiv.id = "boardDiv";
document.body.appendChild(boardDiv);

[0, 1, 2, 3].forEach((z) => {
  var grid = clickableGrid(4, 4, function(el, row, col, i) {
    console.log(`(x,y,z) = (${row + 1},${col + 1},${z + 1})`)
    var event = new CustomEvent('tile-click', {
      detail: {
        x: row, y: col, z: z
      }
    });
    window.dispatchEvent(event);
  });
  var gridDiv = document.createElement('div');
  gridDiv.className = `gridDiv layer-${z}`
  gridDiv.appendChild(grid)

  var gridLabel = document.createElement('p')
  gridLabel.className = "grid-label"
  gridLabel.innerHTML = `Layer ${z + 1}`
  gridDiv.appendChild(gridLabel)

  boardDiv.appendChild(gridDiv);
})


const player1 = humanUIPlayer(window, 1)
const player2 = minimaxPlayer(2)

loop(new Game(player1, player2),
  (g: Game, p: Point) => {
    // g.board.print()
    window.dispatchEvent(new CustomEvent('move-place', {
      detail:
      { x: p.x, y: p.y, z: p.z, n: g.currentPlayer.num }
    }))
  },
  (s: GameEndState, g: Game) => {
    g.board.print()
    if (player1.onGameEnd) player1.onGameEnd(s, g)
    if (player2.onGameEnd) player2.onGameEnd(s, g)
    // hack in order to allow the 'move-place' event to fire first.
    setTimeout(() =>
      alert(`${g.currentPlayer.name} wins!`), 100)
  })

window.addEventListener('move-place', (event: CustomEventInit) => {
  const d = event.detail
  const layerClass = `layer-${d.z}`
  const cellClass = `cell-${d.x}-${d.y}`
  const layer = document.getElementsByClassName(layerClass)
  const cell = layer[0].getElementsByClassName(cellClass)[0]
  cell.innerHTML = d.n.toString()
})