
import {Game, Action} from './game'

type HeuristicFunc = (g: Game) => number
type ActionValue = [Action | null, number]

export function runminimax(g_: Game, getActions: (g: Game) => Action[], 
                  isTerminal: (g: Game) => boolean, h: HeuristicFunc,
                  depth_: number, maxing_: Boolean): ActionValue {

  function minimax(g: Game, depth: number, maxing: Boolean): ActionValue {
    if (depth == 0 || isTerminal(g)) {
      return [null, h(g)]
    }

    if (maxing) {
      var bestValue = Number.MIN_SAFE_INTEGER
      var bestAct: null | Action = null
      for (var child of getActions(g)) {
        var [act, v] = minimax(g.makeMove(child).swapPlayers(), depth-1, false)
        g.reverseMove(child).swapPlayers()
        if (v > bestValue){
          bestValue = v
          bestAct = child
        }
      }
    } else {
      var bestValue = Number.MAX_SAFE_INTEGER
      var bestAct: null | Action = null
      for (var child of getActions(g)) {
        var [act, v] = minimax(g.makeMove(child).swapPlayers(), depth-1, true)
        g.reverseMove(child).swapPlayers()
        if (v < bestValue){
          bestValue = v
          bestAct = child
        }
      }
    }
    return [bestAct, bestValue]
  }
    
  return minimax(g_, depth_, maxing_)
}