const validPosition = (x, y, size, inPlace) => {
	if (!inPlace) {
		let target = Tile.mat[y][x];
		if (target && target.immutable) return false;
		if (target && target instanceof Shelf && target.x === x && target.y === y && target.size === size) return true;
		for (let i = 0 ; i < size ; i++) {
			for (let j = 0 ; j < size ; j++) {
				if (Tile.mat[y+j][x+i]) return false;
			}
		}
	}
	let base = y+size;
	if (base == row) return true;
	for (let i = 0 ; i < size ; i++) {
		if (!Tile.mat[base][x+i] || !Tile.mat[base][x+i].shelf) return false;
	}
	return true;
};


const range = (x, r) => x+rnd()*r;
const breakParticules = (x, y, size, side, scale) => {
	scale = getOrElse(scale, 1);
	for (let i = 0 ; i < 3 ; i++) {
		setTimeout(() => {
			for (let j = 0 ; j < particulesPerSize*size*scale ; j++) {
				new Particule(
					range(x, size)*side, range(y, size)*side,
					1, 1, 1, 1, 1,
					5*size, 0, 1, 1, 0,
					20
				);
			}
		}, 100*i);
	}
};

class Tile {
	constructor(x, y, size, shelf, immutable) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.shelf = shelf;
		this.immutable = immutable;
		this.class = Tile.nameToClass[this.constructor.name];
		Tile.list.push(this);
		for (let i = 0 ; i < size ; i++)
			for (let j = 0 ; j < size ; j++)
				Tile.mat[y+j][x+i] = this;
	}
	anchor() {
		return false;
	}
	validPosition() {
		return validPosition(this.x, this.y, this.size, true);
	}
	destroy(drop, dropShelf) {
		drop = getOrElse(drop, true);
		dropShelf = getOrElse(dropShelf, true);
		if (this.immutable) return false;
		for (let i = 0 ; i < this.size ; i++) {
			for (let j = 0 ; j < this.size ; j++) {
				Tile.mat[this.y+j][this.x+i] = undefined;
			}
		}
		Tile.list.remove(this);
		let hasDrop = false;
		if (drop && !(this instanceof Shelf)) {
			slots.children[this.class.id].get(this.size*usesPerSize);
			hasDrop = true;
		}
		if (dropShelf && this.shelf) {
			slots.children[3].get(this.size*usesPerSize);
			hasDrop = true;
		}
		if (hasDrop) {
			breakParticules(this.x, this.y, this.size, side);
		}
		return true;
	}
	propagate(force) {
		if ((force || !this.validPosition()) && this.destroy()) {
			for (let i = 0 ; i < this.size ; i++) {
				if (this.y > 0 && Tile.mat[this.y-1][this.x+i])
					Tile.mat[this.y-1][this.x+i].schedule();
			}
		}
	}
	schedule() {
		setTimeout(() => this.propagate(), 100);
	}
	draw(ctx) {
		if (this.shelf)
			if (bigShelf) {
				ctx.drawQuad(this.x*side, this.y*side, side*this.size, side*this.size, 3, 0, 0, 0, 0);
			} else {
				for (let i = 0 ; i < this.size ; i++)
					for (let j = 0 ; j < this.size ; j++)
						ctx.drawQuad((this.x+i)*side, (this.y+j)*side, side, side, 3, 0, 0, 0, 0);
			}
	}
};
Tile.list = [];
Tile.mat = Array.from({length: row}, () => Array(col));
Tile.tileFromPipe = (x, y) => Tile.mat[Math.floor(y/5)][Math.floor(x/5)];

class Flask extends Tile {
	constructor(x, y, size, shelf, level, immutable) {
		super(x, y, size, shelf, immutable);
		this.maxLevel = this.class.maxLevel*this.size*this.size*this.size;
		this.minLevel = this.class.minLevel*this.size;
		this.level = 0;
		this.fill = 0;
		this.setLevel(level);
		this.pipeIn = [];
		this.pipeOut = [];
	}
	plugIn(pipe) {
		this.pipeIn.push(pipe);
	}
	plugOut(pipe) {
		this.pipeOut.push(pipe);
	}
	destroy(drop, dropShelf) {
		if (super.destroy(drop, dropShelf)) {
			for (let pipe of this.pipeIn.copy()) pipe.destroy();
			for (let pipe of this.pipeOut.copy()) pipe.destroy();
			return true;
		}
		return false;
	}
	anchor(x, y) {
		return this.class.anchors[this.size-1][y-5*this.y][x-5*this.x];
	}
	setLevel(level) {
		this.level = level
		this.fill = 0.6*level/(levelBase*this.size*this.size*this.size);
	}
	pump() {
		if (this.level <= this.minLevel) return false;
		this.setLevel(this.level-1);
		return true;
	}
	push() {
		if (this.level >= this.maxLevel) return false;
		this.setLevel(this.level+1);
		return true;
	}
};

class Erlenmeyer extends Flask {
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.fill, R, G, B);
	}
};
Erlenmeyer.id = 0;

class Bescher extends Flask {
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.fill, R, G, B);
	}
};
Bescher.id = 1;

class Distillation extends Flask {
	setLevel(level) {
		this.level = level
		if (level > levelBase/2) level += levelBase/3;
		this.fill = 0.6*level/(levelBase*this.size*this.size*this.size);
	}
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.fill, R, G, B);
		super.draw(ctx);
	}
};
Distillation.id = 2;

//STATIC MEMBERS FOR FLASKS
for (let flask of [Erlenmeyer, Bescher, Distillation]) {
	flask.anchors = [
		Array.from({length:5}, ()=>Array(5)),
		Array.from({length:10}, ()=>Array(10))];
	flask.maxLevel = levelBase;
	flask.minLevel = 0;
}
Distillation.minLevel = Math.floor(2*levelBase/3);

for (let [x, y, s, t] of [[2,0,0,1],[4,0,1,1],[5,0,1,1]])
	Erlenmeyer.anchors[s][y][x] = t;
for (let [x, y, s, t] of [[1,0,0,-1],[2,0,0,1],[3,0,0,-1],[3,0,1,-1],[4,0,1,1],[5,0,1,1],[6,0,1,-1]])
	Bescher.anchors[s][y][x] = t;
for (let [x, y, s, t] of [[2,0,0,1],[1,1,0,1],[3,1,0,1],[1,4,0,-1],[3,4,0,-1]])
	Distillation.anchors[s][y][x] = t;

class Shelf extends Tile {
	constructor(x, y, size, _1, _2, immutable) {
		super(x, y, size, true, immutable);
	}
};
Shelf.id = 3;

class Spout extends Tile {
	constructor(x, y, size, shelf, lit, immutable) {
		super(x, y, size, shelf, immutable);
		this.level = 0;
		this.fill = 0;
		this.lit(lit);
		this.tick = 0;
		this.frame = 0;
		this.perFrame = 4;
		this.maxFrame = 7;
	}
	lit(lit) {
		this.fill = lit ? full : 0;
	}
	draw(ctx) {
		if (this.fill) {
			this.tick++;
			if (this.tick >= this.perFrame) {
				this.tick = 0;
				this.frame++;
				if (this.frame >= this.maxFrame) this.frame = 0;
			}
			ctx.drawQuad(this.x*side+22*this.size, this.y*side+21*this.size, this.size*pside, this.size*pside, 20+this.frame, 0, 0, 0, 0);
		}
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 4, this.fill, 0, 0, 0);
	}
};
Spout.id = 4;

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout];
Tile.nameToClass = {"Erlenmeyer": Erlenmeyer, "Bescher": Bescher, "Distillation": Distillation, "Shelf": Shelf, "Spout": Spout};
