const clamp = (x, a, b) => {
	return b < x ? b : a > x ? a : x;
};

let canvasOffset;
const resize = () => {
	canvasOffset = canvas.getBoundingClientRect();
	canvasOffset.scaleX = width/canvas.offsetWidth;
	canvasOffset.scaleY = height/canvas.offsetHeight;
}
const xyOnCanvas = (e) => {
	let x = Math.floor(canvasOffset.scaleX*(e.x-canvasOffset.x));
	let y = Math.floor(canvasOffset.scaleY*(e.y-canvasOffset.y));
	return [Math.floor(x)-xOffset, Math.floor(y)-yOffset];
};

const posToPipe = (x, y) => [Math.floor(x/pside), Math.floor(y/pside)];
const posToTile = (x, y) => [Math.floor(x/side), Math.floor(y/side)];
const pipeToTile = (x, y) => [Math.floor(x/5), Math.floor(y/5)];

mouse = {rx:0, ry:0, x:0, y:0, tx:0, ty:0, px:0, py:0, tile:null, anchor:null, save:null, selected:0, size:1};
mouse.slot = function() {
	return slots.children[this.selected];
}
mouse.showMolecule = function(move) {
	show = false;
	if (Pipe.mat[this.py][this.px]) {
		cursor.innerHTML = Pipe.molecule(this.px, this.py);
		if (move) {
			cursor.style.top = this.py*pside/canvasOffset.scaleY+canvasOffset.y+"px";
			cursor.style.left = (this.px+1)*pside/canvasOffset.scaleX+canvasOffset.x+"px";
		}
		show = true;
	} else if (this.tile instanceof Flask) {
		cursor.innerHTML = this.tile.molecule();
		if (move) {
			cursor.style.top = this.tile.y*side/canvasOffset.scaleY+canvasOffset.y+"px";
			cursor.style.left = this.tile.x*side/canvasOffset.scaleX+canvasOffset.x+"px";
		}
		show = true;
	}
	if (show) {
		cursor.style.display = "";
	} else {
		cursor.style.display = "none";
	}
	return show;
};
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
mouse.calculate = function(force) {
	this.y = clamp(this.ry, 0, height-1-(this.size-1)*side);
	this.x = clamp(this.rx, 0, width-1-(this.size-1)*side);
	let [oldpx, oldpy] = [this.px, this.py];
	let oldTile = this.tile;
	[this.px, this.py] = posToPipe(this.x, this.y);
	if (oldpx === this.px && oldpy === this.py && !force) return;
	[this.tx, this.ty] = posToTile(this.x, this.y);
	this.tile = Tile.mat[this.ty][this.tx];
	if (this.tile) {
		this.anchor = this.tile.anchor(this.px, this.py);
	} else {
		this.anchor = null;
	}
	if (this.selected === 0) {
		this.showMolecule(true);
	}
	this.checkValid();
};
mouse.start = function(e) {
	if (sceneManager.physics) return;
	if (e.which === 1 && this.selected === 0) {
		if (!this.tile || this.tile.anchor(this.px, this.py) !== 1) return;
		mouse.save = {};
		Object.assign(mouse.save, mouse);
	}
};
mouse.end = function(e) {
	if (sceneManager.physics) return;
	if (e.which === 3 && e.target === canvas) {
		let [tx, ty] = posToTile(this.rx, this.ry);
		let tile = Tile.mat[ty][tx];
		if (tile) {
			if (tile.shelf && !(tile instanceof Shelf)) {
				if (this.tile.destroy(true, false)) {
					new Shelf(tile.x, tile.y, tile.size);
				}
			} else {
				tile.propagate(true);
			}
		} else {
			Pipe.searchAndCut(this.px, this.py);
		}
		this.anchor = null;
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
		if (e.target !== canvas || !this.tile || this.tile.anchor(this.px, this.py) !== -1) return;
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
		if (sceneManager.physics) this.showMolecule(false);
		if (this.anchor === 1) {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 0, 1, 0.4);
		} else if (this.anchor === -1) {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 1, 0.2, 0.6);
		} else {
			ctx.drawQuad(this.px*pside, this.py*pside, pside, pside, 9, full, 0.4, .6, 0.7);
		}
	}
};

const keyDispatcher = function(e, fire) {
	if (!fire) {
		if (keyDispatcher.key === e.key) keyDispatcher.fired = false;
		return;
	} else if (sceneManager.frames - keyDispatcher.last > 60) {
		keyDispatcher.fired = false;
	}
	if (keyDispatcher.fired) return;
	keyDispatcher.last = sceneManager.frames;
	keyDispatcher.fired = true;
	keyDispatcher.key = e.key;
	if (e.key === "ArrowRight") {
		sceneManager.nextNarrative();
	} else if (e.key === "ArrowLeft") {
		sceneManager.previousNarrative();
	} else if (e.key === " ") {
		if (sceneManager.physics)
			sceneManager.stop();
		else
			sceneManager.start();
	} else if (e.key === "Enter") {
		sceneManager.reset();
	} else if (e.key === "Backspace") {
		sceneManager.reload();
	}
}
keyDispatcher.fired = false;

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
document.onkeydown = e => keyDispatcher(e, true);
document.onkeyup = e => keyDispatcher(e, false);
