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
	for (let i = 0 ; i < 5 ; i++) {
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

const firework = (x, y, size, side) => {
	for (let i = 0 ; i < 5 ; i++) {
		setTimeout(() => {
			for (let j = 0 ; j < particulesPerSize*size*7 ; j++) {
				let angle = rnd()*Math.PI*2;
		let mag = 0.1*size;
				let ax = Math.sin(angle)*mag;
				let ay = Math.cos(angle)*mag;
				new Particule(
					(x+size/2)*side, (y+size*0.62)*side,
					1, 1, 1, 1, 1,
					5*size, 0, range(0.5,0.5), range(0.5,0.5), 0,
					20, ax, ay
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
Tile.all = type => Tile.list.filter(t => t instanceof type);

class Flask extends Tile {
	constructor(x, y, size, shelf, liquid, immutable) {
		super(x, y, size, shelf, immutable);
		this.maxLevel = this.class.maxLevel*this.size*this.size*this.size;
		this.minLevel = this.class.minLevel*this.size;
		this.fill = 0;
		this.level = 0;
		this.liquid = liquid ? liquid.copy() : [];
		this.updateLevel();
		this.pipeIn = [];
		this.pipeOut = [];
	}
	empty() {
		this.liquid = [];
	}
	molecule() {
		return moleculeList(this.liquid);
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
		if (this.pipeIn.some(pipe => pipe.contains(x, y)) || this.pipeOut.some(pipe => pipe.contains(x, y))) return 0;
		return this.class.anchors[this.size-1][y-5*this.y][x-5*this.x];
	}
	updateLevel() {
		this.level = this.liquid.length;
		this.updateFill();
	}
	updateFill() {
		this.fill = 0.6*this.level/(levelBase*this.size*this.size*this.size);
	}
	isfull() {
		return this.level >= this.maxLevel;
	}
	pump() {
		if (this.liquid.length <= this.minLevel) return false;
		this.level--;
		this.updateFill()
		return this.liquid.shift(0);
	}
	push(droplet) {
		if (this.isfull()) return false;
		this.level++;
		this.updateFill();
		this.liquid.push(droplet);
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
	constructor(x, y, size, shelf, liquid, immutable) {
		super(x, y, size, shelf, liquid, immutable);
		this.react0 = [];
		this.react1 = [];
	}
	empty() {
		this.liquid = [];
		this.react0 = [];
		this.react1 = [];
	}
	molecule() {
		return moleculeList(this.react0)+"\n"+moleculeList(this.react1)+"\n"+moleculeList(this.liquid);
	}
	tryReact0(b) {
		let r;
		for (let a of this.react0) {
			r = fuse(a, b);
			if (r) {
				this.react0.remove(a);
				return r;
			}
		}
		return false;
	}
	tryReact1(a) {
		let r;
		for (let b of this.react1) {
			r = fuse(a, b);
			if (r) {
				this.react1.remove(b);
				return r;
			}
		}
		return false;
	}
	push(droplet, pipe) {
		let r;
		let primary = pipe === this.pipeIn[0];
		if (primary) {
			r = this.tryReact1(droplet);
			if (r) {
				this.liquid.push(r);
				return true;
			}
		} else {
			r = this.tryReact0(droplet);
			if (r) {
				this.liquid.push(r);
				return true;
			}
		}
		if (this.isfull()) return false;
		this.level++;
		this.updateFill();
		if (primary) {
			this.react0.push(droplet);
		} else {
			this.react1.push(droplet);
		}
		return true;
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.fill, R, G, B);
	}
};
Bescher.id = 1;

class Distillation extends Flask {
	updateFill() {
		let level = this.level;
		if (level > levelBase/2) level += levelBase/3;
		this.fill = 0.6*level/levelBase;
	}
	anchor(x, y) {
		let anchor = super.anchor(x, y);
		//if (anchor === -1 && this.pipeIn.length > 0) return 0;
		return anchor;
	}
	push(droplet) {
		if (this.level === this.maxLevel && this.y > 0) {
			let topTower = Tile.mat[this.y-1][this.x];
			if (topTower instanceof Distillation && topTower.push(this.liquid[0])) {
				this.pump();
			}
		}
		let pushed = super.push(droplet);
		if (pushed && this.hot) droplet.distill();
		return pushed;
	}
	onFire() {
		if (this.hot) return true;
		if (this.y < row-1) {
			let tile = Tile.mat[this.y+1][this.x];
			if (tile instanceof Spout) {
				this.hot = true;
			} else if (tile instanceof Distillation) {
				this.hot = tile.onFire();
			} else {
				this.hot = false;
			}
		}
		return this.hot;
	}
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.fill, R, G, B);
		super.draw(ctx);
	}
};
Distillation.id = 2;

class Vessel extends Flask {
	constructor(x, y, size, shelf, goal, immutable) {
		super(x, y, size, shelf, [], immutable);
		this.goal = [goal[0], goal[1].print()];
		Vessel.list.push(this);
	}
	molecule() {
		return super.molecule()+"\n\n"+this.goal[0]+" "+this.goal[1];
	}
	push(droplet) {
		let pushed = super.push(droplet);
		if (pushed) {
			this.completed = this.liquid.filter(e => e.print() === this.goal[1]).length >= this.goal[0];
			if (this.completed) {
				firework(this.x, this.y, this.size, side, 3);
				sceneManager.complete();
			}
		}
		return pushed;
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 5, this.fill, R, G, B);
	}
}
Vessel.list = [];
Vessel.id = 5;

//STATIC MEMBERS FOR FLASKS
for (let flask of [Erlenmeyer, Bescher, Distillation, Vessel]) {
	flask.anchors = [
		Array.from({length:5}, ()=>Array(5)),
		Array.from({length:10}, ()=>Array(10))];
	flask.maxLevel = levelBase;
	flask.minLevel = 0;
}
Distillation.minLevel = Math.floor(2*levelBase/3);

for (let [x, y, s, t] of [[2,0,0,1],[4,0,1,1],[5,0,1,1]]) {
	Erlenmeyer.anchors[s][y][x] = t;
	Vessel.anchors[s][y][x] = -t;
}
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
	constructor(x, y, size, shelf, immutable) {
		super(x, y, size, shelf, immutable);
		this.fill = 0;
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

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout, Vessel];
Tile.nameToClass = {"Erlenmeyer": Erlenmeyer, "Bescher": Bescher, "Distillation": Distillation, "Shelf": Shelf, "Spout": Spout, "Vessel": Vessel};
