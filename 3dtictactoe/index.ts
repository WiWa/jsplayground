
import {Game, loop, Board, GameEndState} from './game'
import {humanTerminalPlayer} from './players'



const human1 = humanTerminalPlayer(1)
const human2 = humanTerminalPlayer(2)

loop(new Game(human1, human2), 
      (g: Game) => g.board.print(), 
      (s: GameEndState, g: Game) => {
        if (human1.onGameEnd) human1.onGameEnd(s, g)
        if (human2.onGameEnd) human2.onGameEnd(s ,g)
      })