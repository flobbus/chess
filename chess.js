/**
* pre: empty table must exist in HTML
* post: generates board and cells
*/

function chess() {
	buildTable();
	placePieces();
	document.getElementById("reset").onmousedown = function(){
		reset()
		chess();
	};
}

/**
*post: generates empty table and initializes variables
*/
function buildTable(){
	document.getElementById("body").style.backgroundColor = "darkgray";
	table = document.getElementById("table");
	table.whiteTurn = true;
	table.checkingcheck = false;
	table.from = null;
	table.inCheck = false;
	table.isCastling = false;
	n=8; //n is the size of the board
	for(let i = 0; i < n; i++){
		table.insertRow(i);
		for(let j = 0; j < n; j++){
			table.rows[i].insertCell(j);
			cell = table.rows[i].cells[j];
			cell.id = i*n+j;
			cell.isWhite = false;
			cell.pieceName = ''; //should line up with official chess notation
			cell.option = false; //
			cell.hasMoved = false;
			cell.check = false;
			cell.castle = false;

			if((cell.id)%2 != i%2){
				cell.style.backgroundColor="grey";
			}

		cell.onmousedown =  function(){ click(this); };
		}
	}
}

/**
*post: places all pieces.
*/
function placePieces(){
	for(let i = 0; i < 2*n; i++){
	 // 	cell.isWhite = (cell.id<2*n);  //assigns initial white
	 // 	cell.hasPiece = ((cell.id>(n-2)*n-1)||(cell.id<2*n)); //assigns all
			whitePiece = document.getElementById(i);
			blackPiece = document.getElementById(n*n-i-1);
			whitePiece.isWhite = true;
			blackPiece.isWhite = false;

			whitePiece.hasPiece = true;
			blackPiece.hasPiece = true;

			whitePiece.pieceName = "rnbkqbnrpppppppp".charAt(i);
			blackPiece.pieceName = "rnbqkbnrpppppppp".charAt(i);

			whitePiece.innerHTML = "<img src=\"img/w" + "rnbkqbnrpppppppp".charAt(i) + ".png\">";
			blackPiece.innerHTML = "<img src=\"img/b" + "rnbqkbnrpppppppp".charAt(i) + ".png\">";
	}
}

/**
*post: resets the table.
*/
function reset(){
		for(let l = (n-1); l >= 0; l--){
			table.deleteRow(l);
		}
}
/**
* pre: board must exist with cells, click must have happened on a cell
* post: decides what to do with click depending on what's within the cell,
* 		whose turn it is, and if a piece has been clicked or jumped before
* @param cell the cell that was clicked
*/
function click(cell){
	console.log("cell #", cell.id, "option: ", cell.option, "check: ", cell.check, "white: ", cell.isWhite);
	if(!table.shown){
		if(cell.hasPiece){
			if(cell.isWhite==table.whiteTurn){
				showOptions(cell);
			}
		}
	}
	else{
		if((table.from.isWhite==cell.isWhite)&&(cell.hasPiece)){
			resetOptions();
			showOptions(cell);
		}
		if(cell.option){
			if(cell.castle){
				doCastle(table.from, cell)
			}
			else{
				tentativeMove(table.from, cell);
			}
		}
	}
}

/**
* pre: board must exist with cells, click must have happened on a cell that had a piece in it
* post: shows any cells that the piece can move or jump to, marks them as options or jump, and
* prepares the board for the next jump or move.
* @param cell the cell that was clicked
*/

function showOptions(cell){
	table.shown = true;
	table.from = cell;
	if(cell.pieceName=='p'){ //PAWN
		if(cell.isWhite){
			linOptions(cell, "dn", false);
			diagOptions(cell, "br", false);
			diagOptions(cell, "bl", false);
			}
		else{
			linOptions(cell, "up", false);
			diagOptions(cell, "tl", false);
			diagOptions(cell, "tr", false);
		}
		if(!cell.hasMoved){ //don't need to check for end bounds because it can't get there without moving at least once
			//need to implement taking en passant
			sign = (cell.isWhite) ? 1 : -1;
			enpassantCell = document.getElementById(parseInt(cell.id) + sign*n);
			if(!enpassantCell.hasPiece){
				enpassantCell.pieceName = 'p'; //possibly a bad idea
				if(cell.isWhite){
					linOptions(enpassantCell, "dn", false);
				}
				else{
					linOptions(enpassantCell, "up", false);
				}
				enpassantCell.pieceName = ''; //could also be a bad idea
			}
		}
	}

	if(cell.pieceName=='r'){ //ROOK
		linOptions(cell, "up", true);
		linOptions(cell, "rt", true);
		linOptions(cell, "dn", true);
		linOptions(cell, "lf", true);
	}

	if(cell.pieceName=='b'){ //BISHOP
		diagOptions(cell, "tr", true);
		diagOptions(cell, "br", true);
		diagOptions(cell, "bl", true);
		diagOptions(cell, "tl", true);
	}

	if(cell.pieceName=='q'){ //QUEEN
		linOptions(cell, "up", true);
		linOptions(cell, "rt", true);
		linOptions(cell, "dn", true);
		linOptions(cell, "lf", true);
		diagOptions(cell, "tr", true);
		diagOptions(cell, "br", true);
		diagOptions(cell, "bl", true);
		diagOptions(cell, "tl", true);
	}

	if(cell.pieceName=='k'){ //KING
		//need to make sure they're not moving into check
		//need to implement castling
		linOptions(cell, "up", false);
		linOptions(cell, "rt", false);
		linOptions(cell, "dn", false);
		linOptions(cell, "lf", false);
		diagOptions(cell, "tr", false);
		diagOptions(cell, "br", false);
		diagOptions(cell, "bl", false);
		diagOptions(cell, "tl", false);
		castleOptions(cell);
	}

	if(cell.pieceName=='n'){ //KNIGHT
		knightOptions(cell);
	}
}
/**
*post: changes cell colors to denote moving options
*@param cell cell chosen
*@param direction the direction to check
*@param recurse boolean that controls recursion
*/
function diagOptions(cell, direction, recurse){
	let diagonals = {tr:1-n, br:1+n, bl:-1+n, tl:-1-n};
	let exists = {bl:false, br:false, tl:false, tr:false};
	exists.tr = ((parseInt(cell.id)%n != (n-1))&&(parseInt(cell.id) - n >= 0));
	exists.br = ((parseInt(cell.id)%n != (n-1))&&(parseInt(cell.id) + parseInt(n) < n*n));
	exists.bl = ((parseInt(cell.id)%n != 0)&&(parseInt(cell.id) + parseInt(n) < n*n));
	exists.tl = ((parseInt(cell.id)%n != 0)&&(parseInt(cell.id) - n >= 0));

	if(exists[direction]){
		nearCell = document.getElementById(parseInt(cell.id)+parseInt(diagonals[direction]));
		if((cell.pieceName != 'k')||(nearCell.check != true)||(table.checkingcheck)){
			if(nearCell.hasPiece){
				if((nearCell.isWhite != table.whiteTurn)||(table.checkingcheck)){ //if the piece in the toCell is the fromCell's opposite color
					nearCell.option = true;
					nearCell.style.backgroundColor="lightBlue";
				}
			}
			else{
				if((cell.pieceName != 'p')||table.checkingcheck){ //pawns can only move diagonally if where they're taking a piece
					nearCell.option = true;
					nearCell.style.backgroundColor="lightBlue";
					if(recurse){
						diagOptions(nearCell, direction, recurse);
					}
				}
			}
		}
	}
}
/**
*post: changes cell colors to denote moving options
*@param cell cell chosen
*@param direction the direction to check
*@param recurse boolean that controls recursion
*/
function linOptions(cell, direction, recurse){
	let cardinals =  {up:(-n), rt:1, dn:n, lf:(-1)};
	let exists = {up:false, rt:false, dn:false, lf:false};

	exists.up = (parseInt(cell.id) - parseInt(n) >= 0);
	exists.rt = (parseInt(cell.id)%n != (n-1));
	exists.dn = (parseInt(cell.id) + parseInt(n) < n*n);
	exists.lf = (parseInt(cell.id)%n != 0);

	if(exists[direction]){
		nearCell = document.getElementById(parseInt(cell.id)+parseInt(cardinals[direction]));
		if((cell.pieceName != 'k')||(nearCell.check != true)||(table.checkingcheck)){
			if(nearCell.hasPiece){
				if(cell.pieceName != 'p'){ //pawns can't take pieces in front of them
					if((nearCell.isWhite != table.whiteTurn)||(table.checkingcheck)){ //if the piece in the toCell is the fromCell's opposite color
						nearCell.option = true;
						nearCell.style.backgroundColor="lightBlue";
					}
				}
			}
			else{
				if((cell.pieceName != 'p')||!table.checkingcheck){
					nearCell.option = true;
					nearCell.style.backgroundColor="lightBlue";
					if(recurse){
						linOptions(nearCell, direction, recurse);
					}
				}
			}
		}
	}
}
/**
*post: determines if there is a castling option
*@param cell chosen cell
*/
function castleOptions(cell){
	if(!(cell.hasMoved||table.inCheck)){
		if(!(document.getElementById(parseInt(cell.id)-1).hasPiece||document.getElementById(parseInt(cell.id)-2).hasPiece)){
			if(!(document.getElementById(parseInt(cell.id)-1).check||document.getElementById(parseInt(cell.id)-2).check)){
				if(!document.getElementById(parseInt(cell.id)-3).hasMoved){
					document.getElementById(parseInt(cell.id)-2).option = true;
					document.getElementById(parseInt(cell.id)-2).castle = true;
					document.getElementById(parseInt(cell.id)-2).style.backgroundColor="lightBlue";

				}
			}
		}
		if(!(document.getElementById(parseInt(cell.id)+1).hasPiece||document.getElementById(parseInt(cell.id)+2).hasPiece||document.getElementById(parseInt(cell.id)+3).hasPiece)){
			if(!(document.getElementById(parseInt(cell.id)+1).check||document.getElementById(parseInt(cell.id)+2).check||document.getElementById(parseInt(cell.id)+3).check)){
				if(!document.getElementById(parseInt(cell.id)+4).hasMoved){
					document.getElementById(parseInt(cell.id)+2).option = true;
					document.getElementById(parseInt(cell.id)+2).castle = true;
					document.getElementById(parseInt(cell.id)+2).style.backgroundColor="lightBlue";

				}
			}
		}
	}
}
/**
*pre: castling is possible
*post: performs castling switch
*@param fromCell initial cell
*@param toCell end cell
*/
function doCastle(fromCell, toCell){
	table.isCastling = true;
	tentativeMove(fromCell, toCell);
	table.isCastling = false;
	if(toCell.id % 8 == 5){ //queenside
		tentativeMove(document.getElementById(parseInt(fromCell.id)+4), document.getElementById(parseInt(fromCell.id)+1));
	}
	else if(toCell.id % 8 == 1){ //kingside
		tentativeMove(document.getElementById(parseInt(fromCell.id)-3), document.getElementById(parseInt(fromCell.id)-1));
	}
}

/**
*pre: a knight was chosen
*post: displays possible path choices by changing cell colors to light blue
*@param cell chosen cell
*/
function knightOptions(cell){
	cell_j = cell.id%n;
	cell_i=Math.floor(cell.id/n);
	if(cell_i>=2){
		if(cell_j>=1)
			knightSet(table.rows[cell_i-2].cells[cell_j-1]);
		if(cell_j<(n-1))
			knightSet(table.rows[cell_i-2].cells[cell_j+1]);
	}

	if(cell_i>=1){
		if(cell_j>=2)
			knightSet(table.rows[cell_i-1].cells[cell_j-2]);
		if(cell_j<(n-2))
			knightSet(table.rows[cell_i-1].cells[cell_j+2]);
	}

	if(cell_i<(n-1)){
		if(cell_j>=2)
			knightSet(table.rows[cell_i+1].cells[cell_j-2]);
		if(cell_j<(n-2))
			knightSet(table.rows[cell_i+1].cells[cell_j+2]);
	}

	if(cell_i<(n-2)){
		if(cell_j>=1)
			knightSet(table.rows[cell_i+2].cells[cell_j-1]);
		if(cell_j<(n-1))
			knightSet(table.rows[cell_i+2].cells[cell_j+1]);
	}


}

/**
*pre: cell is part of a potential path
*post: changes cell's color to lightBlue
*@param cell current cell
*/
function knightSet(cell){
	if(cell.hasPiece){
		if((cell.isWhite != table.whiteTurn)||table.checkingcheck){ //if the piece in the toCell is the fromCell's opposite color
			cell.option = true;
			cell.style.backgroundColor="lightBlue";
		}
	}
	else{
			cell.option = true;
			cell.style.backgroundColor="lightBlue";
		}
	}

/**
* pre: board must exist with cells, click must have happened on a cell that had a piece in it
* post: Gives the toCell the properties of the fromCell and then resets the fromCell
* @param fromCell the cell you're moving piece from
* @param toCell the cell you're moving it to
*/

function tentativeMove(fromCell, toCell){
		let tempisWhite = toCell.isWhite;
		let temppieceName = toCell.pieceName;
		let temphasPiece = toCell.hasPiece;
		let tempinnerHTML = toCell.innerHTML;


		toCell.isWhite = fromCell.isWhite;
		toCell.pieceName = fromCell.pieceName;
		toCell.innerHTML = fromCell.innerHTML;
		toCell.hasPiece = true;
		fromCell.pieceName = '';
		fromCell.isWhite = false;
		fromCell.hasPiece = false;
		fromCell.innerHTML = "";
		checkcheck(table.whiteTurn);
		if(table.inCheck){
			fromCell.pieceName = toCell.pieceName;
			fromCell.isWhite = toCell.isWhite;
			fromCell.hasPiece = true;
			fromCell.innerHTML = toCell.innerHTML;
			toCell.isWhite = tempisWhite;
			toCell.pieceName = temppieceName;
			toCell.hasPiece = temphasPiece;
			toCell.innerHTML = tempinnerHTML;
		}
		else{
			toCell.hasMoved = true; //pretty sure this never needs to be reset to false EVER
			fromCell.hasMoved = true;
			if((toCell.pieceName == 'p')&&((toCell.id < n)||(toCell.id >= n*(n-1)))){ //promote pawn
				toCell.pieceName = 'q';
				(table.whiteTurn) ? toCell.innerHTML = "<img src=\"img/wq.png\">" : 	toCell.innerHTML = "<img src=\"img/bq.png\">";
			}
			if(!table.isCastling){
				newTurn();
			}
		}
}

/**
*pre: called at beginning of new turn
*post: determines if king is in check
*@param isWhite true if it is white's turn
*/
function checkcheck(isWhite){
	table.checkingcheck = true;
	resetCheck();
	resetOptions();
	for(let i = 0; i < n*n; i++){
		cell = document.getElementById(i);
		if((cell.hasPiece)&&(cell.isWhite != isWhite)){
			if(cell.pieceName != 'p'){
				showOptions(cell);
			}
			else{ //PAWN
				if(cell.isWhite){
					diagOptions(cell, "br", false);
					diagOptions(cell, "bl", false);
					}
				else{
					diagOptions(cell, "tl", false);
					diagOptions(cell, "tr", false);
				}
			}
		}
	}
	for(let i = 0; i < n*n; i++){
		cell = document.getElementById(i);
		cell.check = cell.option;
		if ((cell.isWhite == isWhite)&&cell.check&&(cell.pieceName == 'k')){
			table.inCheck = true;
			console.log("king's in check!");
		}
	}
	resetOptions();
	table.checkingcheck = false;
}


/**
* pre: chess() must have been run
* post: Resets options, calls resetOPtions, resets the fromCell, toggles whose turn it is
*/

function newTurn() {
	table.from = null;
	resetOptions();
	resetCheck();
	table.whiteTurn = !table.whiteTurn;
	checkcheck(table.whiteTurn);
	table.whiteTurn ? document.getElementById("body").style.backgroundColor = "darkgray" : document.getElementById("body").style.backgroundColor ="black";
}

/**
* pre: chess() must have been run
* post: goes through each cell and undoes everything that showOptions could have done to each cell
*/

function resetOptions(){
	for(let i = 0; i < n; i++){
		for(let j = 0; j < n; j++){
			cell = document.getElementById(i*n+j);
			cell.option = false;
			cell.castle = false;
			((i*n+j)%2 != i%2) ? cell.style.backgroundColor="grey" : cell.style.backgroundColor="white";
		}
	}
	table.shown = false;
}

/**
*pre: new turn is called
*post: resets check variables
*/
function resetCheck(){
	table.inCheck = false;
	for(let i = 0; i < n; i++){
		for(let j = 0; j < n; j++){
			cell = document.getElementById(i*n+j);
			cell.check = false;
		}
	}
}

/**
*function used for development testing
*/
function showCheck(){
	checkcheck(table.whiteTurn);
	for(let i = 0; i < n; i++){
		for(let j = 0; j < n; j++){
			cell = document.getElementById(i*n+j);
			if(cell.check){
				cell.style.backgroundColor="red";
			}
		}
	}
}


/**
* pre: the HTML button exists
* post: Takes the user back to the home page of the arcade
*/
function backHome(){
  window.location.replace("../homePage.html");
}

/**
*pre: test button is clicked.
*post: runs all tests.
*/
function test(){
	test = document.getElementById("test");
	test.style.fontSize = "10px";
	let u = 0;
	let p = [];
	for(m = 0; m < 20; m++){
		p[m] = document.createElement('p');
		p[m].style.fontSize = "10px";
	}
	reset();
	buildTable();

	let testCell = document.getElementById(0);
	testCell.hasPiece = true;
  testCell.pieceName = 'p';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wp.png\">";

	p[u].innerHTML += "Testing piece placement: ";
	(testCell.hasPiece&&(testCell.pieceName == 'p')) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing downwards linear non-recursive move options: ";
	testCell.onmousedown();
	(table.rows[1].cells[0].option == true) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing pawn initially being able to move two spaces: ";
	(table.rows[2].cells[0].option == true) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing tentativeMove() function: ";
	testCell = table.rows[1].cells[0];
	testCell.onmousedown();
	(testCell.hasPiece&&(testCell.pieceName == 'p')) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that turn did switch to black's after white pawn moved: ";
	(table.whiteTurn == false) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that black player cannot move or get options for white's piece: ";
	testCell.onmousedown();
	(table.rows[2].cells[0].option == false) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that pawn can only move once after having been moved previously: ";
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	(table.rows[3].cells[0].option == false) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	newTurn();
	reset();
	buildTable();
	testCell = document.getElementById(0);
	testCell.hasPiece = true;
	table.whiteTurn = true;
  testCell.pieceName = 'b';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wb.png\">";

	p[u].innerHTML += "Testing recursive diagonal options: ";
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	let worked = table.rows[1].cells[1].option&&table.rows[2].cells[2].option&&table.rows[3].cells[3].option&&table.rows[4].cells[4].option&&table.rows[5].cells[5].option&&table.rows[6].cells[6].option&&table.rows[7].cells[7].option;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;


	newTurn();
	reset();
	buildTable();
	testCell = document.getElementById(0);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'r';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wr.png\">";

	p[u].innerHTML += "Testing vertical linear recursive move options: ";
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	worked = table.rows[1].cells[0].option&&table.rows[2].cells[0].option&&table.rows[3].cells[0].option&&table.rows[4].cells[0].option&&table.rows[5].cells[0].option&&table.rows[6].cells[0].option&&table.rows[7].cells[0].option;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing horizontal linear recursive move options: ";
	worked = table.rows[0].cells[1].option&&table.rows[0].cells[2].option&&table.rows[0].cells[4].option&&table.rows[0].cells[5].option&&table.rows[0].cells[6].option&&table.rows[0].cells[7].option&&table.rows[0].cells[3].option;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	kingCell = document.getElementById(3);
	kingCell.hasMoved = false;
	kingCell.hasPiece = true;
  kingCell.pieceName = 'k';
	kingCell.isWhite = true;
	kingCell.innerHTML = "<img src=\"img/wk.png\">";


	p[u].innerHTML += "Testing that castling under incorrect conditions doesn't work: ";
	document.getElementById(10).hasPiece = true;
	document.getElementById(10).pieceName = 'r';
	document.getElementById(10).isWhite = false;
	document.getElementById(10).innerHTML = "<img src=\"img/br.png\">";
	checkcheck();
	kingCell.onmousedown();
	document.getElementById(1).onmousedown();
	worked = !((document.getElementById(1).pieceName == 'k')&&(document.getElementById(2).pieceName == 'r'));
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing castling under correct conditions: ";
	document.getElementById(10).hasPiece = false;
	document.getElementById(10).pieceName = '';
	document.getElementById(10).isWhite = false;
	document.getElementById(10).innerHTML = '';
	newTurn();
	newTurn();
	kingCell.onmousedown();
	document.getElementById(1).onmousedown();
	worked = ((document.getElementById(1).pieceName == 'k')&&(document.getElementById(2).pieceName == 'r'));
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that knight move options are where they should be: ";
	newTurn();
	reset();
	buildTable();
	testCell = document.getElementById(18);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'n';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wn.png\">";
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	worked = table.rows[0].cells[1].option&&table.rows[0].cells[3].option&&table.rows[1].cells[0].option&&table.rows[1].cells[4].option&&table.rows[3].cells[0].option&&table.rows[3].cells[4].option&&table.rows[4].cells[1].option&&table.rows[4].cells[3].option;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that king isn't shown options that are in check: ";
	reset();
	buildTable();
	testCell = document.getElementById(40);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'r';
	testCell.isWhite = false;
	testCell.innerHTML = "<img src=\"img/br.png\">";

	testCell = document.getElementById(42);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'r';
	testCell.isWhite = false;
	testCell.innerHTML = "<img src=\"img/br.png\">";

	testCell = document.getElementById(1);
	testCell.hasMoved = true;
	testCell.hasPiece = true;
	testCell.pieceName = 'k';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wk.png\">";

	newTurn();
	newTurn();
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	worked = !table.rows[0].cells[0].option&&!table.rows[0].cells[2].option&&!table.rows[1].cells[0].option&&table.rows[1].cells[1].option&&!table.rows[1].cells[2].option;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing piece capture: ";
	reset();
	buildTable();
	testCell = document.getElementById(1);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'b';
	testCell.isWhite = false;
	testCell.innerHTML = "<img src=\"img/bb.png\">";

	testCell = document.getElementById(0);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'r';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wr.png\">";

	newTurn();
	newTurn();
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkgray";
	testCell.onmousedown();
	document.getElementById(1).onmousedown();
	testCell = document.getElementById(1);
	worked = testCell.hasMoved&&testCell.isWhite&&(testCell.pieceName == 'r')&&(testCell.innerHTML == "<img src=\"img/wr.png\">")&&testCell.hasPiece;
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing that player can't move a piece if it would put their own king in check: ";
	reset();
	buildTable();
	testCell = document.getElementById(1);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'b';
	testCell.isWhite = false;
	testCell.innerHTML = "<img src=\"img/bb.png\">";

	testCell = document.getElementById(0);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
  testCell.pieceName = 'r';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wr.png\">";

	testCell = document.getElementById(2);
	testCell.hasMoved = false;
	testCell.hasPiece = true;
	testCell.pieceName = 'k';
	testCell.isWhite = false;
	testCell.innerHTML = "<img src=\"img/bk.png\">";

	newTurn();
	table.whiteTurn = false;
	document.getElementById("body").style.backgroundColor = "black";
	document.getElementById(1).onmousedown();
	document.getElementById(8).onmousedown();
	worked = (document.getElementById(1).pieceName == 'b');
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

	p[u].innerHTML += "Testing pawn promotion to queen: ";
	reset();
	buildTable();
	testCell = document.getElementById(48);
	testCell.hasMoved = true;
	testCell.hasPiece = true;
  testCell.pieceName = 'p';
	testCell.isWhite = true;
	testCell.innerHTML = "<img src=\"img/wp.png\">";

	newTurn();
	newTurn();
	table.whiteTurn = true;
	document.getElementById("body").style.backgroundColor = "darkGrey";
	document.getElementById(48).onmousedown();
	document.getElementById(56).onmousedown();
	worked = (document.getElementById(56).pieceName == 'q');
	(worked) ? p[u].innerHTML += "Passed\n" : p[u].innerHTML += "Failed\n";
	test.appendChild(p[u]);
	u++;

}
