class Tile {
	constructor(x, y, size, shelf) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.shelf = shelf;
		Tile.list.push(this);
		for (let i = 0 ; i < size ; i++)
			for (let j = 0 ; j < size ; j++)
				Tile.mat[y+j][x+i] = this;
	}
	anchor() {
		return false;
	}
	draw(ctx) {
		if (this.shelf)
			for (let i = 0 ; i < this.size ; i++)
				for (let j = 0 ; j < this.size ; j++)
					ctx.drawQuad((this.x+i)*side, (this.y+j)*side, side, side, 3, 0, 0, 0, 0);
	}
};
Tile.list = [];
Tile.mat = Array.from({length: row}, () => Array(col));

class Flask extends Tile {
	constructor(x, y, size, shelf, level, R, G, B) {
		super(x, y, size, shelf);
		this.level = 0;
		this.fill(level);
		this.R = R;
		this.G = G;
		this.B = B;
	}
	anchor(type, x, y) {
		return type.anchors[this.size-1][y-5*this.y][x-5*this.x] === 1;
	}
	fill(level) {
		this.level = Math.min(level, full);
	}
};

class Erlenmeyer extends Flask {
	anchor(x, y) {
		return super.anchor(Erlenmeyer, x, y);
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.level, R, G, B);
	}
};

class Bescher extends Flask {
	anchor(x, y) {
		return super.anchor(Bescher, x, y);
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.level, R, G, B);
	}
};

class Distillation extends Flask {
	anchor(x, y) {
		return super.anchor(Distillation, x, y);
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.level, R, G, B);
	}
};

//ANCHORS FOR FLASKS
for (let flask of [Erlenmeyer, Bescher, Distillation]) {
	flask.anchors = [
		Array.from({length:5}, ()=>Array(5)),
		Array.from({length:10}, ()=>Array(10))];
}
for (let [x, y, s] of [[2,0,0],[4,0,1],[5,0,1]])
	Erlenmeyer.anchors[s][y][x] = 1;
for (let [x, y, s] of [[1,0,0],[2,0,0],[3,0,0],[3,0,1],[4,0,1],[5,0,1],[6,0,1]])
	Bescher.anchors[s][y][x] = 1;
for (let [x, y, s] of [[2,0,0],[1,1,0],[3,1,0],[1,4,0],[3,4,0]])
	Distillation.anchors[s][y][x] = 1;

class Shelf extends Tile {
	constructor(x, y, size) {
		super(x, y, size, true);
	}
};

class Spout extends Tile {
	constructor(x, y, size, shelf, lit) {
		super(x, y, size, shelf);
		this.level = 0;
		this.lit(lit);
	}
	lit(lit) {
		this.level = lit ? full : 0;
	}
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 4, this.level, 0, 0, 0);
	}
};

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout];

class Pipe {
	constructor(x, y, path, persistent, full) {
		if (Pipe.last)
			Pipe.list.push(this);
		else
			Pipe.list[Pipe.list.length-1] = this;
		Pipe.last = persistent;
		this.persistent = persistent;
		this.path = [];
		let dx, dy, ddx, ddy;
		ddx = ddy = 0;
		for (let i = 0 ; i < path.length ; i++) {
			[dx, dy] = path[i];
			if (dx) {
				ddx = dx > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([x*pside, y*pside, 9-ddx+3*ddy]);
				for (let j = ddx ; j != dx ; j += ddx)
					this.path.push([(x+j)*pside, y*pside, 6]);
			} else {
				ddy = dy > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([x*pside, y*pside, 9+ddx-3*ddy]);
				for (let j = ddy ; j != dy ; j+=ddy)
					this.path.push([x*pside, (y+j)*pside, 8]);
			}
			x += dx;
			y += dy;
		}
		this.path.reverse();
		if (full)
			this.liquid = Array.from({length:this.path.length}, ()=>true);
		else
			this.liquid = Array(this.path.length);
	}
	push(n) {
		if (!this.persistent) return;
		for (let i = 0 ; i < n ; i++)
			this.liquid.push(true);
	}
	flow() {
		if (!this.persistent) return;
		this.liquid.shift(0);
		if (this.liquid.length < this.path.length)
			this.liquid.push(false);
	}
	draw(ctx) {
		let x, y, t;
		for (let i = 0 ; i < this.path.length ; i++) {
			[x, y, t] = this.path[i];
			if (this.liquid[i])
				ctx.drawQuad(x, y, pside, pside, t, full, R, G, B);
			else
				ctx.drawQuad(x, y, pside, pside, t, 0, 0, 0, 0);
		}
	}
};
Pipe.last = true;
Pipe.list = [];
Pipe.fromPoints = (x0, y0, x1, y1, persistent) => {
	if (x0 === x1 && y0 === y1) return;
	let pad = 1;
	let [ox, oy] = [x0, y0];
	let [tx0, ty0] = pipeToTile(x0, y0);
	let [tx1, ty1] = pipeToTile(x1, y1);
	let [px0, py0] = [x0-5*tx0, y0-5*ty0];
	let [px1, py1] = [x1-5*tx1, y1-5*ty1];
	let path = [];
	let tmp = [0, 0];

	let full = mouse.tile && mouse.tile.anchor(mouse.px, mouse.py);
	if (py0 == 0) {
		oy += pad;
		y0 -= 1;
		path.push([0, -pad-1]);
	} else if (px0 < 2) {
		ox += pad;
		x0 -= 2;
		path.push([-pad-2, 0]);
	} else if (px0 > 2) {
		ox -= pad;
		x0 += 2;
		path.push([pad+2, 0]);
	}

	if (full) {
		if (py1 == 0) {
			y1 -= 1;
			tmp = [0, pad+1];
		} else if (px1 < 2) {
			x1 -= 2;
			tmp = [pad+2, 0];
		} else if (px1 > 2) {
			x1 += 2;
			tmp = [-pad-2, 0];
		}
	}

	if (x0 != x1) {
		if (path.last()[0])
			path.last()[0] += x1-x0;
		else
			path.push([x1-x0, 0]);
	}
	if (y0 != y1) {
		if (tmp[1])
			tmp[1] += y1-y0;
		else
			path.push([0, y1-y0]);
	}
	if (tmp[0] !== 0 || tmp[1] !== 0) {
		path.push(tmp);
	}
	new Pipe(ox, oy, path, persistent, full);
}


let obj = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,0,3,0,3,0,0],
	[0,0,2,0,0,3,0,3,0,0],
	[0,0,0,0,2,3,0,3,0,0],
	[0,0,0,0,0,5,0,0,0,0]];
let shelf = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,0,1,0,0],
	[0,0,0,1,0,1,0,1,0,0],
	[0,0,0,0,0,1,0,1,0,0],
	[0,0,0,0,1,1,0,1,0,0]];
let fill = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,.4,0,.7,0,0,0,0],
	[0,0,.2,0,0,1,0,0,0,0],
	[0,0,0,0,.1,1,0,0,0,0],
	[0,0,0,0,0,.9,0,0,0,0]];
let pipes = [
	[[3,1,2,4],[0,-5],[4,0],[0,15]],
	[[5,1,2,2],[0,-5],[-4,0],[0,15]],
	[[5,3,2,4],[5,0],[0,1],[-1,0],[0,-2],[2,0],[0,-5],[-1,0],[0,4],[2,0],[0,-1],[-7,0]],
	[[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]
];

let R = 0;
let G = 0.8;
let B = 0.75;
let tmp;
for (let i = 0 ; i < 10 ; i++) {
	for (let j = 0 ; j < 5 ; j++) {
		if (obj[j][i]) {
			tmp = new Tile.types[obj[j][i]-1](i, j, 1, shelf[j][i] === 1, fill[j][i], 0, 0.8, 0.75);
		} else if (shelf[j][i])
			new Shelf(i, j, 1);
	}
}
new Bescher(0, 3, 2, false, 0, R, G, B);
new Erlenmeyer(2, 3, 2, true, 0.4, R, G, B);
new Erlenmeyer(7, 3, 2, false, 0, R, G, B);
new Spout(8, 3, 2, false);

for (let pipe of pipes) {
	let [X, Y, x, y] = pipe[0];
	new Pipe(X*5+x, Y*5+y, pipe.splice(1), true);
}
