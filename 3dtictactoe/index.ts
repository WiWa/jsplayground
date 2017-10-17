
import {Game, loop, Board, GameEndState} from './game'
import {humanTerminalPlayer} from './players'



const human1 = humanTerminalPlayer(1)
const human2 = humanTerminalPlayer(2)

loop(new Game(human1, human2), 
      function(g: Game){ g.board.print() }, 
      function(s: GameEndState, g: Game){
        console.log(s, g)
      })