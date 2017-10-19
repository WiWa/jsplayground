
import * as G from './game'

import { getLine, Point, Game, Board, GameEndState, loop } from './game'

import { randomPlayer } from './players'

import { assert } from 'chai'

describe('Get Line', () => {
  it('should get the right lines', () => {
    var input: G.Coordinates[][] = [
      [[1, 1, 1], [1, 1, 1]],
      [[1, 1, 1], [1, 1, -1]],
      [[3, 3, 3], [1, 1, -1]]
    ]
    var expectedpoints: G.Coordinates[][] = [
      [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
      [[1, 1, 1], [2, 2, 0], [0, 0, 2]],
      [[3, 3, 3]]
    ]
    for (var i in input) {
      var expected = expectedpoints[i].map(xyz => new Point(xyz))
      var line = getLine(new Point(input[i][0]), new Point(input[i][1]))
      assert.equal(expected.length, line.length)
      // This test looks weird because of the way Javascript does '=='.
      // Can't use Sets or even .indexOf() for this.
      expected.forEach(p =>
        assert.isTrue(line.filter(p2 => p2.equals(p)).length == 1))
    }
  });
});

describe("Manhattan Distance", () => {
  it("should be right", () => {
    var a = new Point([1, 1, 3])
    var b = new Point([2, 2, 1])
    assert.equal(a.manDist(b), 4)
    assert.equal(a.manDist(a), 0)
  })
})

describe("Number of winning lines", () => {
  it("should be 76", () => {
    assert.equal(new Board().getAllWinnableLines().length, 76)
  })
})

describe("Random Player Testing", () => {
  it('should make the right wins', () => {
    Array(100).fill(0).forEach((i) => {
      const player1 = randomPlayer(1)
      const player2 = randomPlayer(2)

      loop(new Game(player1, player2),
        (g: Game) => { },
        (s: GameEndState, g: Game) => {
          if (s.tie) {
            assert.isTrue(g.board.isFull())
          } else {
            const line = s.winningLine.sort((a, b) => a.z - b.z)
              .sort((a, b) => a.y - b.y)
              .sort((a, b) => a.x - b.x)
            assert.equal(line.length, 4)
            const dist = line[0].manDist(line[1])
            var validDist = dist == 1 || dist == 2 || dist == 3
            assert.isTrue(validDist)
            assert.equal(line[1].manDist(line[2]), dist)
            assert.equal(line[2].manDist(line[3]), dist)
          }
        })
    })
  })
})

