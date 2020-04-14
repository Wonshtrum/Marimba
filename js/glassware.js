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
	validPosition() {
		let base = this.y+this.size;
		if (base == row) return true;
		for (let i = 0 ; i < this.size ; i++) {
			if (!Tile.mat[base][this.x+i] || !Tile.mat[base][this.x+i].shelf) return false;
		}
		return true;
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
	constructor(x, y, size, shelf, level, R, G, B) {
		super(x, y, size, shelf);
		this.level = 0;
		this.fill = 0;
		this.setLevel(level);
		this.R = R;
		this.G = G;
		this.B = B;
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
for (let [x, y, s, t] of [[2,0,0,1],[1,1,0,-1],[3,1,0,-1],[1,4,0,-1],[3,4,0,-1]])
	Distillation.anchors[s][y][x] = t;

class Shelf extends Tile {
	constructor(x, y, size) {
		super(x, y, size, true);
	}
};

class Spout extends Tile {
	constructor(x, y, size, shelf, lit) {
		super(x, y, size, shelf);
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
		this.tick++;
		if (this.tick >= this.perFrame) {
			this.tick = 0;
			this.frame++;
			if (this.frame >= this.maxFrame) this.frame = 0;
		}
		super.draw(ctx);
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 4, this.fill, 0, 0, 0);
		ctx.drawQuad(this.x*side+22*this.size, this.y*side+21*this.size, this.size*pside, this.size*pside, 20+this.frame, 0, 0, 0, 0);
	}
};

Tile.types = [Erlenmeyer, Bescher, Distillation, Shelf, Spout];


function astar(x, y, gx, gy, dx, dy, path){
	let pile = [[x, y, 0, 0, dx, dy, path]];
	let cache = [[x, y]];
	let minI, minX, g, h, ddx, ddy, dir, cross, p;
	while (pile.length) {
		minI = pile.length-1;
		minX = pile[minI][3];
		for (let i = pile.length-2 ; i >= 0 ; i--) {
			if (pile[i][3] < minX) {
				minI = i;
				minX = pile[i][3];
			}
		}
		[x, y, g, h, ddx, ddy, p] = pile.splice(minI, 1)[0];
		for ([dx, dy] of [[-ddy, -ddx], [ddy, ddx], [ddx, ddy]]) {
			if (x+dx < 0 || y+dy < 0 || x+dx >= col*5 || y+dy >= row*5) continue;
			dir = dx !== ddx || dy !== ddy ? 1 : 0;
			cross = Pipe.mat[y+dy][x+dx]*10;
			path = Array.from(p, e => [e[0], e[1]]);
			if (dir) {
				path.push([dx, dy]);
			} else {
				path.last()[0] += dx;
				path.last()[1] += dy;
			}
			if (x+dx === gx && y+dy === gy) return path;
			if (!Tile.tileFromPipe(x+dx,y+dy) && !cache.some(e => e[0] === x+dx && e[1] === y+dy)) {
				pile.push([x+dx, y+dy, g+1+dir*1.8+cross, g+1+dir*1.8+cross+Math.abs(x+dx-gx)+Math.abs(y+dy-gy), dx, dy, path]);
				cache.push([x+dx, y+dy]);
			}
		}
	}
	return null;
}

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
		if (persistent)
			for (let [x, y] of this.path)
				Pipe.mat[y/pside][x/pside]++;
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
Pipe.mat = Array.from({length:row*5}, () => Array(col*5).fill(0));
Pipe.fromPoints = (x0, y0, x1, y1, persistent) => {
	if (x0 === x1 && y0 === y1) return;
	let pad = 1;
	let [ox, oy] = [x0, y0];
	let [tx0, ty0] = pipeToTile(x0, y0);
	let [tx1, ty1] = pipeToTile(x1, y1);
	let [px0, py0] = [x0-5*tx0, y0-5*ty0];
	let [px1, py1] = [x1-5*tx1, y1-5*ty1];
	let [dx, dy] = [0, -1];
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
		[dx, dy] = [-1, 0];
		path.push([-pad-2, 0]);
	} else if (px0 > 2) {
		ox -= pad;
		x0 += 2;
		[dx, dy] = [1, 0];
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

	path = astar(x0, y0, x1, y1, dx, dy, path);
	if (path === null) {
		if (!Pipe.last) {
			Pipe.last = true;
			Pipe.list.pop();
		}
		return;
	}
	if (tmp[0] === path.last()[0] || tmp[1] === path.last()[1]) {
		path.last()[0] += tmp[0];
		path.last()[1] += tmp[1];
	} else
		path.push(tmp);
	new Pipe(ox, oy, path, persistent, full);
}

let obj = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,0,3,0,3,0,0],
	[0,0,2,0,0,3,0,3,0,0],
	[2,0,1,0,2,3,0,1,0,0],
	[0,0,0,0,0,5,0,0,0,0]];
let big = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[1,0,1,0,0,0,0,1,0,0],
	[0,0,0,0,0,0,0,0,0,0]];
let shelf = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,0,1,0,0],
	[0,0,0,1,0,1,0,1,0,0],
	[0,0,1,0,0,1,0,1,0,0],
	[0,0,0,0,1,1,0,0,0,0]];
let fill = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,3,0,6,0,0,0,0],
	[0,0,5,0,0,6,0,0,0,0],
	[7,0,22,0,2,6,0,0,0,0],
	[0,0,0,0,0,1,0,0,0,0]];
let pipes = [
	[[3,1,2,4],[0,-5],[4,0],[0,15]],
	[[5,1,2,2],[0,-5],[-4,0],[0,15]],
	[[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]
];

let R = 0;
let G = 0.8;
let B = 0.75;
for (let i = 0 ; i < 10 ; i++) {
	for (let j = 0 ; j < 5 ; j++) {
		if (obj[j][i]) {
			new Tile.types[obj[j][i]-1](i, j, big[j][i]+1, shelf[j][i] === 1, fill[j][i], R, G, B);
		} else if (shelf[j][i])
			new Shelf(i, j, 1);
	}
}
for (let pipe of pipes) {
	let [X, Y, x, y] = pipe[0];
	new Pipe(X*5+x, Y*5+y, pipe.splice(1), true);
}
