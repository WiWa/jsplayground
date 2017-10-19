
import { Game, loop, Board, GameEndState } from './game'
import { humanTerminalPlayer, randomPlayer, minimaxPlayer } from './players'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// const player1 = humanTerminalPlayer(rl, 1)
// const player2 = humanTerminalPlayer(rl, 2)
// const player1 = randomPlayer(1)
const player1 = minimaxPlayer(1, 1, 0.1)
const player2 = minimaxPlayer(2)

var aggregator = [0,0,0]

function run(){
  loop(new Game(player1, player2),
    (g: Game) => {
      // g.board.print()
    },
    (s: GameEndState, g: Game) => {
      // g.board.print()
      if (g.winningPlayer) aggregator[g.winningPlayer.num]++
      else aggregator[0]++
      if (player1.onGameEnd) player1.onGameEnd(s, g)
      if (player2.onGameEnd) player2.onGameEnd(s, g)
      rl.close()
    })
}
Array(10).fill(0).forEach((i) => run())
console.log(aggregator)