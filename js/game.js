let clamp = function(x, a, b) {
	return a > x ? a:b < x ? b : x;
};

let xyOnCanvas = function(e) {
	let x = Math.floor(width*(e.x-canvas.offsetLeft)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvas.offsetTop)/canvas.offsetHeight);
	return [Math.floor(x), Math.floor(y)];
};

let mouse = {x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, save:null};
mouse.update = function(e) {
	[this.x, this.y] = xyOnCanvas(e);
	this.y = clamp(this.y+8, 0, height-1);
	[this.tx, this.ty] = [Math.floor(this.x/side), Math.floor(this.y/side)];
	[this.px, this.py] = [Math.floor(this.x/pside), Math.floor(this.y/pside)];
	this.tile = Tile.mat[this.ty][this.tx];
}
mouse.start = function() {
	if (!this.tile || !this.tile.anchor(this.px, this.py)) return;
	mouse.save = {};
	Object.assign(mouse.save, mouse);
}
mouse.end = function() {
	let save = this.save;
	this.save = null;
	if (!save || !this.tile || !this.tile.anchor(this.px, this.py)) return;
	Pipe.fromPoints(save, this);
}

canvas.onmousemove = (e) => mouse.update(e);
canvas.onmousedown = () => mouse.start();
canvas.onmouseup = () => mouse.end();
