class Tile {
	constructor(x, y, size, shelf) {
		this.x = x-colH;
		this.y = y-rowH;
		this.size = size;
		this.shelf = shelf;
		Tile.list.push(this);
		for (let i = 0 ; i < size ; i++)
			for (let j = 0 ; j < size ; j++)
				Tile.mat[y+j][x+i] = this;
	}
	draw(ctx) {
		if (this.shelf)
			for (let i = 0 ; i < this.size ; i++)
				for (let j = 0 ; j < this.size ; j++)
					ctx.drawQuad((this.x+i)*side, (this.y+j)*side, side, side, 3, 0, 0, 0, 0);
	}
}
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
	fill(level) {
		this.level = Math.min(level, full);
	}
}

class Erlenmeyer extends Flask {
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.level, R, G, B);
	}
}

class Bescher extends Flask {
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.level, R, G, B);
	}
}

class Distillation extends Flask {
	draw(ctx) {
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.level, R, G, B);
	}
}

class Shelf extends Tile {
	constructor(x, y, size) {
		super(x, y, size, true);
	}
}

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
}

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout];

class Pipe {
	constructor(x, y, path) {
		Pipe.list.push(this);
		this.path = [];
		let X = colH*5;
		let Y = rowH*5;
		let dx, dy, ddx, ddy;
		ddx = ddy = 0;
		for (let i = 0 ; i < path.length ; i++) {
			[dx, dy] = path[i];
			if (dx) {
				ddx = dx > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([(x-X)*pside, (y-Y)*pside, 9-ddx+3*ddy]);
				for (let j = ddx ; j != dx ; j += ddx)
					this.path.push([(x+j-X)*pside, (y-Y)*pside, 6]);
			} else {
				ddy = dy > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([(x-X)*pside, (y-Y)*pside, 9+ddx-3*ddy]);
				for (let j = ddy ; j != dy ; j+=ddy)
					this.path.push([(x-X)*pside, (y+j-Y)*pside, 8]);
			}
			x += dx;
			y += dy;
		}
		this.path.reverse();
		this.liquid = Array(this.path.length);
	}
	push(n) {
		for (let i = 0 ; i < n ; i++)
			this.liquid.push(true);
	}
	flow() {
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
}
Pipe.list = [];

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
	[[3,1,2,4,0,30],[0,-5],[4,0],[0,15]],
	[[5,1,2,2,0,43],[0,-5],[-4,0],[0,15]],
	[[5,3,2,4,0,7],[5,0],[0,1],[-1,0],[0,-2],[2,0],[0,-5],[-1,0],[0,4],[2,0],[0,-1],[-7,0]],
	[[2,2,2,5,0,12],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]
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
	new Pipe(X*5+x, Y*5+y, pipe.splice(1));
}
