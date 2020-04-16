const clamp = (x, a, b) => {
	return a > x ? a:b < x ? b : x;
};

let canvasOffset;
const resize = () => {
	canvasOffset = canvas.getBoundingClientRect();
	//narrative.style.lineHeight = canvas.offsetHeight;
}
const xyOnCanvas = (e) => {
	let x = Math.floor(width*(e.x-canvasOffset.x)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvasOffset.y)/canvas.offsetHeight);
	return [Math.floor(x)-xOffset, Math.floor(y)-yOffset];
};

const posToPipe = (x, y) => [Math.floor(x/pside), Math.floor(y/pside)];
const posToTile = (x, y) => [Math.floor(x/side), Math.floor(y/side)];
const pipeToTile = (x, y) => [Math.floor(x/5), Math.floor(y/5)];

mouse = {rx:0, ry:0, x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, save:null, selected:0, size:1};
mouse.slot = function() {
	return slots.children[this.selected];
}
mouse.update = function() {
	let slot = this.slot();
	if (slot.size === 2 && slot.count < 2*usesPerSize && slot.count > -1) {
		slot.size = 1;
	} if (slot.count === 0) {
		select(0);
	}
	this.size = this.slot().size;
	this.calculate();
}
mouse.checkValid = function() {
	if (this.selected === 0 && this.save) {
		Pipe.fromPoints(this.save.px, this.save.py, this.px, this.py, false, this.save.tile, this.tile);
	} else if (this.selected === 3) {
		this.isValidPosition = (this.tile && !this.tile.shelf && !this.tile.immutable && this.tile.size === this.size && this.tile.x === this.tx && this.tile.y === this.ty) || (validPosition(this.tx, this.ty, this.size) && !(this.tile instanceof Shelf));
	} else if (this.selected !== 0) {
		this.isValidPosition = validPosition(this.tx, this.ty, this.size);
	}
};
mouse.move = function(e) {
	[this.rx, this.ry] = xyOnCanvas(e);
	this.calculate();
};
mouse.calculate = function() {
	this.y = clamp(this.ry, 0, height-1-(this.size-1)*side);
	this.x = clamp(this.rx, 0, width-1-(this.size-1)*side);
	let [oldpx, oldpy] = [this.px, this.py];
	[this.px, this.py] = posToPipe(this.x, this.y);
	[this.tx, this.ty] = posToTile(this.x, this.y);
	this.tile = Tile.mat[this.ty][this.tx];
	this.checkValid();
};
mouse.start = function(e) {
	if (e.which === 1 && this.selected === 0) {
		if (!this.tile || this.tile.anchor(this.px, this.py) !== 1) return;
		mouse.save = {};
		Object.assign(mouse.save, mouse);
	}
};
mouse.end = function(e) {
	if (e.which === 3 && e.target === canvas) {
		if (this.tile) {
			if (this.tile.shelf && !(this.tile instanceof Shelf)) {
				if (this.tile.destroy(true, false)) {
					new Shelf(this.tile.x, this.tile.y, this.tile.size);
				}
			} else {
				this.tile.propagate(true);
			}
		} else {
			Pipe.searchAndCut(this.px, this.py);
		}
		this.update();
		return;
	}
	if (e.which !== 1) return;
	let save = this.save;
	if (save && save.selected === 0) {
		this.save = null;
		if (!Pipe.last) {
			Pipe.last = true;
			Pipe.list.pop();
		}
		if (!this.tile || this.tile.anchor(this.px, this.py) !== -1) return;
		Pipe.fromPoints(save.px, save.py, this.px, this.py, true, save.tile, this.tile);
	}
	if (e.target === canvas) {
		if (this.selected === 3 && this.isValidPosition && this.tile) {
			this.tile.shelf = true;
		} else if (this.selected !== 0 && this.isValidPosition) {
			let shelf = false;
			if (this.tile instanceof Shelf) {
				shelf = true;
				this.tile.destroy(false, false);
			}
			new Tile.types[this.selected](this.tx, this.ty, this.size, shelf, 0);
		}
		if (this.isValidPosition) {
			this.slot().use(this.size*usesPerSize);
		}
		this.update();
	}
};
mouse.wheel = function(e) {
	let slot = this.slot();
	if (!slot.big) return;
	if (e.deltaY < 0) {
		slot.size = 2;
	} else {
		slot.size = 1;
	}
	this.update();
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
		ctx.drawQuad(this.tx*side, this.ty*side, this.size*side, this.size*side, this.selected, 0, 0.4, .6, 0.7);
	}
};

const keyDispatcher = e => {
	if (e.key === "ArrowRight") {
		sceneManager.nextNarrative();
	} else if (e.key === "ArrowLeft") {
		sceneManager.previousNarrative();
	}
}

select(0);
resize();

window.onresize = () => {
	resize();
	setTimeout(resize, 1000);
};
document.onmousemove = e => mouse.move(e);
document.onmousedown = e => mouse.start(e);
document.onmouseup = e => mouse.end(e);
document.onwheel = e => mouse.wheel(e);
document.oncontextmenu = e => e.preventDefault();
document.onkeydown = e => keyDispatcher(e);
