
// https://stackoverflow.com/questions/9140101/creating-a-clickable-grid-in-a-web-browser

type EventListenerCallback = (el: HTMLElement, 
                              row: number, col: number, i: number) => void

function clickableGrid(rows: number, cols: number, 
                        callback: EventListenerCallback){
  var i=0;
  var grid = document.createElement('table');
  grid.className = 'grid';
  for (var r=0;r<rows;++r){
    var tr = grid.appendChild(document.createElement('tr'));
    for (var c=0;c<cols;++c){
      var cell = tr.appendChild(document.createElement('td'));
      // cell.innerHTML = (++i).toString();
      cell.addEventListener('click',(function(el,r,c,i){
        return function(){ callback(el,r,c,i); }
       })(cell,r,c,i),false);
    }
  }
  return grid;
}

[0,1,2,3].forEach((z) => {
  var grid = clickableGrid(4,4,function(el,row,col,i){
    // console.log("You clicked on element:",el);
    // console.log("You clicked on row:",row);
    // console.log("You clicked on col:",col);
    // console.log("You clicked on item #:",i);
    console.log(`(x,y,z) = (${row+1},${col+1},${z+1})`)
  });
  var gridDiv = document.createElement('div');
  gridDiv.className = `gridDiv layer-${z}`
  gridDiv.appendChild(grid)

  var gridLabel = document.createElement('p')
  gridLabel.innerHTML = `Layer ${z+1}`
  gridDiv.appendChild(gridLabel)

  const boardDiv = document.getElementById("boardDiv");
  if (boardDiv) boardDiv.appendChild(gridDiv);
})