

function isPositiveInteger(str: string) {
  var n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}


function humanUIPlayer(window: Window,
  num: 1 | 2, name?: string): Player {
  function getMoveFromUI(g: Game, inputCallback: ReadPointFunction): void {
    const handler = (event: CustomEventInit) => {
      const p = event.detail
      const point = new Point([p.x, p.y, p.z])
      window.removeEventListener('tile-click', handler)
      if (point.isValid() && g.board.get(point) == 0) {
        window.dispatchEvent(new CustomEvent('move-place', {
          detail:
          { x: p.x, y: p.y, z: p.z, n: num }
        }))
        inputCallback(point)
      } else {
        alert("Invalid Move!")
        getMoveFromUI(g, inputCallback)
      }
    }
    window.addEventListener('tile-click', handler)
  }
  return new Player(getMoveFromUI, num, name)
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function randomPlayer(num: 1 | 2, name?: string): Player {
  function getMove(g: Game, inputCallback: ReadPointFunction): void {
    const unset = g.board.getUnsetPoints()
    inputCallback(unset[getRandomInt(0, unset.length)])
  }
  return new Player(getMove, num, name)
}


function minimaxPlayer(num: 1 | 2, depth: number = 1,
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
    if (action != null) inputCallback(action)
    else {
      fallback.getMove(g, inputCallback)
    }
  }
  return new Player(getMove, num, name)
}