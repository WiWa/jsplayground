
// https://stackoverflow.com/questions/9140101/creating-a-clickable-grid-in-a-web-browser

import {Player, Game, loop, ReadPointFunction, 
        Board, Point, GameEndState, Tile } from './game'
import {humanUIPlayer, randomPlayer, minimaxPlayer} from './players'

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

const gameDiv = document.getElementById("gameDiv");
const boardDiv = document.createElement('div');
boardDiv.id = "boardDiv";
if (gameDiv) gameDiv.appendChild(boardDiv);
else throw new Error("No #gameDiv!");


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