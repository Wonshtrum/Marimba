const clamp = (x, a, b) => {
	return a > x ? a:b < x ? b : x;
};


let canvasOffset;
const updateCanvasOffset = () => canvasOffset = canvas.getBoundingClientRect();
const xyOnCanvas = (e) => {
	let x = Math.floor(width*(e.x-canvasOffset.x)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvasOffset.y)/canvas.offsetHeight);
	return [Math.floor(x)-xOffset, Math.floor(y)-yOffset];
};

const posToPipe = (x, y) => [Math.floor(x/pside), Math.floor(y/pside)];
const posToTile = (x, y) => [Math.floor(x/side), Math.floor(y/side)];
const pipeToTile = (x, y) => [Math.floor(x/5), Math.floor(y/5)];

mouse = {x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, save:null, selected:0, size:1};
mouse.update = function(e) {
	[this.x, this.y] = xyOnCanvas(e);
	this.y = clamp(this.y, 0, height-1);
	let [oldpx, oldpy] = [this.px, this.py];
	[this.px, this.py] = posToPipe(this.x, this.y);
	if (oldpx === this.px && oldpy === this.py) return;
	[this.tx, this.ty] = posToTile(this.x, this.y);
	this.tile = Tile.mat[this.ty][this.tx];
	if (this.selected === 0 && this.save) {
		Pipe.fromPoints(this.save.px, this.save.py, this.px, this.py, false);
	} else if (this.selected === 3) {
		this.isValidPosition = (this.tile && !this.tile.shelf) || (!this.tile && validPosition(this.tx, this.ty, this.size));
	} else if (this.selected !== 0) {
		this.isValidPosition = !this.tile && validPosition(this.tx, this.ty, this.size);
	}
};
mouse.start = function() {
	if (this.selected === 0) {
		if (!this.tile || this.tile.anchor(this.px, this.py) !== 1) return;
		mouse.save = {};
		Object.assign(mouse.save, mouse);
	}
};
mouse.end = function() {
	let save = this.save;
	if (save && save.selected === 0) {
		this.save = null;
		if (!Pipe.last) {
			Pipe.last = true;
			Pipe.list.pop();
		}
		if (!this.tile || !this.tile.anchor(this.px, this.py)) return;
		Pipe.fromPoints(save.px, save.py, this.px, this.py, true);
	} else if (this.selected === 3 && this.isValidPosition && this.tile) {
		this.tile.shelf = true;
	} else if (this.selected !== 0 && this.isValidPosition) {
		new Tile.types[this.selected](this.tx, this.ty, 1, false, 0, R, G, B);
	}
	if (this.isValidPosition) {
		slots.children[this.selected].use();
	}
	this.isValidPosition = false;
};
mouse.drawRect = function(ctx) {
	if (this.selected !== 0) {
		if (this.isValidPosition) {
			ctx.drawQuad(this.tx*side, this.ty*side, this.size*side, this.size*side, 9, full, 0, 0.5, 0.3);
		} else {
			ctx.drawQuad(this.tx*side, this.ty*side, this.size*side, this.size*side, 9, full, 0.1, 0.2, 0.3);
		}
	} else if (this.tile) {
		ctx.drawQuad(this.tile.x*side, this.tile.y*side, this.tile.size*side, this.tile.size*side, 9, full, 0.1, 0.2, 0.3);
	}
};
mouse.draw = function(ctx) {
	if (this.selected === 0) {
		if (this.tile && this.tile.anchor(this.px, this.py) === 1) {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 0, 1, 0.4);
		} else if (this.tile && this.tile.anchor(this.px, this.py) === -1) {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 1, 0.2, 0.6);
		} else {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 0.4, .6, 0.7);
		}
	} else {
		ctx.drawQuad(this.tx*side, this.ty*side, side, side, this.selected, 0, 0.4, .6, 0.7);
	}
};

select(0);
updateCanvasOffset();

window.onresize = updateCanvasOffset;
document.onmousemove = (e) => mouse.update(e);
document.onmousedown = () => mouse.start();
document.onmouseup = () => mouse.end();
