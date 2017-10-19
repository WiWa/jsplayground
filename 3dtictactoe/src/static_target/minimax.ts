type HeuristicFunc = (g: Game) => number
type Action = Point
type ActionValue = [Action | null, number]

function runminimax(g_: Game, getActions: (g: Game) => Action[], 
                  isTerminal: (g: Game) => boolean, h: HeuristicFunc,
                  depth_: number, maxing_: Boolean): ActionValue {

  function minimax(game: Game, depth: number, maxing: Boolean): ActionValue {
    if (depth == 0 || isTerminal(game)) {
      return [null, h(game)]
    }

    if (maxing) {
      var bestValue = Number.MIN_SAFE_INTEGER
      var bestAct = null
      for (var child of getActions(game)) {
        var g = game.copy()
        var [act, v] = minimax(g.makeMove(child).swapPlayers(), depth-1, false)
        if (v > bestValue){
          bestValue = v
          bestAct = child
        }
      }
    } else {
      var bestValue = Number.MAX_SAFE_INTEGER
      var bestAct = null
      for (var child of getActions(game)) {
        var g = game.copy()
        var [act, v] = minimax(g.makeMove(child).swapPlayers(), depth-1, true)
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