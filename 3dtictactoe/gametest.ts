
import * as G from './game'

import {getLine, Point} from './game'

import {assert} from 'chai'

describe('Get Line', () => {
  it('should get the right lines', () => {
    var input: G.Coordinates[][] = [
        [[1,1,1],[1,1,1]],
        [[1,1,1],[1,1,-1]],
        [[3,3,3],[1,1,-1]]
      ]
    var expectedpoints: G.Coordinates[][] = [ 
      [[0,0,0],[1,1,1],[2,2,2],[3,3,3]],
      [[1,1,1],[2,2,0],[0,0,2]],
      [[3,3,3]]
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

