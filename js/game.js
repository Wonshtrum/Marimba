const clamp = (x, a, b) => {
	return a > x ? a:b < x ? b : x;
};

const xyOnCanvas = (e) => {
	let x = Math.floor(width*(e.x-canvas.offsetLeft)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvas.offsetTop-main.offsetTop)/canvas.offsetHeight);
	return [Math.floor(x), Math.floor(y)];
};

const posToPipe = (x, y) => [Math.floor(x/pside), Math.floor(y/pside)];
const posToTile = (x, y) => [Math.floor(x/side), Math.floor(y/side)];
const pipeToTile = (x, y) => [Math.floor(x/5), Math.floor(y/5)];

mouse = {x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, save:null, selected:0};
mouse.update = function(e) {
	[this.x, this.y] = xyOnCanvas(e);
	this.y = clamp(this.y+8, 0, height-1);
	let [oldpx, oldpy] = [this.px, this.py];
	[this.px, this.py] = posToPipe(this.x, this.y);
	if (oldpx === this.px && oldpy === this.py) return;
	[this.tx, this.ty] = posToTile(this.x, this.y);
	this.tile = Tile.mat[this.ty][this.tx];
	if (this.save)
		Pipe.fromPoints(this.save.px, this.save.py, this.px, this.py, false);
}
mouse.start = function() {
	if (this.selected === 0) {
		if (!this.tile || this.tile.anchor(this.px, this.py) !== 1) return;
		mouse.save = {};
		Object.assign(mouse.save, mouse);
	} else {

	}
}
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
	} else if (this.selected !== 0) {
		new Tile.types[this.selected](this.tx, this.ty, 1, false, 0, R, G, B);
	}
}
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
		let hside = side/2;
		ctx.drawQuad(this.tx*side, this.ty*side, side, side, this.selected, full, 0.4, .6, 0.7);
	}
}
select(0);

document.onmousemove = (e) => mouse.update(e);
document.onmousedown = () => mouse.start();
document.onmouseup = () => mouse.end();
