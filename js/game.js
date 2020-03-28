const clamp = (x, a, b) => {
	return a > x ? a:b < x ? b : x;
};

const xyOnCanvas = (e) => {
	let x = Math.floor(width*(e.x-canvas.offsetLeft)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvas.offsetTop)/canvas.offsetHeight);
	return [Math.floor(x), Math.floor(y)];
};

const posToPipe = (x, y) => [Math.floor(x/pside), Math.floor(y/pside)];
const posToTile = (x, y) => [Math.floor(x/side), Math.floor(y/side)];
const pipeToTile = (x, y) => [Math.floor(x/5), Math.floor(y/5)];

let mouse = {x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, save:null};
mouse.update = function(e) {
	[this.x, this.y] = xyOnCanvas(e);
	this.y = clamp(this.y+8, 0, height-1);
	[this.tx, this.ty] = posToTile(this.x, this.y);
	[this.px, this.py] = posToPipe(this.x, this.y);
	this.tile = Tile.mat[this.ty][this.tx];
	if (this.save)
		Pipe.fromPoints(this.save.px, this.save.py, this.px, this.py, false);
}
mouse.start = function() {
	if (!this.tile || !this.tile.anchor(this.px, this.py)) return;
	mouse.save = {};
	Object.assign(mouse.save, mouse);
}
mouse.end = function() {
	let save = this.save;
	this.save = null;
	if (!Pipe.last) {
		Pipe.last = true;
		Pipe.list.pop();
	}
	if (!save || !this.tile || !this.tile.anchor(this.px, this.py)) return;
	Pipe.fromPoints(save.px, save.py, this.px, this.py, true);
}

canvas.onmousemove = (e) => mouse.update(e);
canvas.onmousedown = () => mouse.start();
canvas.onmouseup = () => mouse.end();
