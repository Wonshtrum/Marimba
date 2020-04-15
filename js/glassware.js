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

class Tile {
	constructor(x, y, size, shelf, immutable) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.shelf = shelf;
		this.immutable = immutable;
		Tile.list.push(this);
		for (let i = 0 ; i < size ; i++)
			for (let j = 0 ; j < size ; j++)
				Tile.mat[y+j][x+i] = this;
	}
	getId() {
		return Tile.nameToId[this.constructor.name];
	}
	anchor() {
		return false;
	}
	validPosition() {
		return validPosition(this.x, this.y, this.size, true);
	}
	destroy(drop, dropShelf) {
		drop = drop || drop === undefined;
		dropShelf = dropShelf || dropShelf === undefined;
		if (this.immutable) return false;
		for (let i = 0 ; i < this.size ; i++) {
			for (let j = 0 ; j < this.size ; j++) {
				Tile.mat[this.y+j][this.x+i] = undefined;
			}
		}
		Tile.list.remove(this);
		if (drop && !(this instanceof Shelf)) {
			slots.children[this.getId()].get(this.size*usesPerSize);
		}
		if (dropShelf && this.shelf) {
			slots.children[3].get(this.size*usesPerSize);
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
		this.level = 0;
		this.fill = 0;
		this.setLevel(level);
	}
	anchor(type, x, y) {
		return type.anchors[this.size-1][y-5*this.y][x-5*this.x];
	}
	setLevel(level) {
		this.level = level
		this.fill = 0.6*level/(6*this.size*this.size);
	}
};

class Erlenmeyer extends Flask {
	anchor(x, y) {
		return super.anchor(Erlenmeyer, x, y);
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.fill, R, G, B);
	}
};

class Bescher extends Flask {
	anchor(x, y) {
		return super.anchor(Bescher, x, y);
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.fill, R, G, B);
	}
};

class Distillation extends Flask {
	anchor(x, y) {
		return super.anchor(Distillation, x, y);
	}
	setLevel(level) {
		this.level = level
		if (level > 3) level += 2
		this.fill = 0.6*level/(6*this.size*this.size);
	}
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.fill, R, G, B);
		super.draw(ctx);
	}
};

//ANCHORS FOR FLASKS
for (let flask of [Erlenmeyer, Bescher, Distillation]) {
	flask.anchors = [
		Array.from({length:5}, ()=>Array(5)),
		Array.from({length:10}, ()=>Array(10))];
}
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

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout];
Tile.nameToId = {"Erlenmeyer": 0, "Bescher": 1, "Distillation": 2, "Shelf": 3, "Spout": 4};
