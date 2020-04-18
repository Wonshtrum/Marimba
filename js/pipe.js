const astar = (x, y, gx, gy, dx, dy, path) => {
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
			cross = Pipe.mat[y+dy][x+dx]*10+(Tile.tileFromPipe(x+dx,y+dy) ? 100 : 0);
			path = Array.from(p, e => [e[0], e[1]]);
			if (dir) {
				path.push([dx, dy]);
			} else {
				path.last()[0] += dx;
				path.last()[1] += dy;
			}
			if (x+dx === gx && y+dy === gy) return path;
			if (!cache.some(e => e[0] === x+dx && e[1] === y+dy)) {
				pile.push([x+dx, y+dy, g+1+dir*1.8+cross, g+1+dir*1.8+cross+Math.abs(x+dx-gx)+Math.abs(y+dy-gy), dx, dy, path]);
				cache.push([x+dx, y+dy]);
			}
		}
	}
	return null;
};

class Pipe {
	constructor(x, y, path, persistent, full, immutable) {
		if (Pipe.last)
			Pipe.list.push(this);
		else
			Pipe.list[Pipe.list.length-1] = this;
		Pipe.last = persistent;
		this.persistent = persistent;
		this.immutable = immutable;
		this.path = [];
		this.input = null;
		this.output = null;
		let dx, dy, ddx, ddy;
		ddx = ddy = 0;
		for (let i = 0 ; i < path.length ; i++) {
			[dx, dy] = path[i];
			if (dx) {
				ddx = dx > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([x*pside, y*pside, 10-ddx+3*ddy]);
				for (let j = ddx ; j != dx ; j += ddx)
					this.path.push([(x+j)*pside, y*pside, 7]);
			} else {
				ddy = dy > 0 ? 1 : -1;
				if (i != 0)
					this.path.push([x*pside, y*pside, 10+ddx-3*ddy]);
				for (let j = ddy ; j != dy ; j+=ddy)
					this.path.push([x*pside, (y+j)*pside, 9]);
			}
			x += dx;
			y += dy;
		}
		if (persistent) {
			let [inx, iny] = posToTile(...this.path[0]);
			let [outx, outy] = posToTile(...this.path.last());
			this.connect(Tile.mat[iny][inx], Tile.mat[outy][outx]);
			for (let [x, y] of this.path)
				Pipe.mat[y/pside][x/pside]++;
			this.path.reverse();
		}
		this.liquid = Array.from({length:this.path.length}, () => full === true);
	}
	connect(input, output) {
		this.input = input;
		this.output = output;
		input.plugOut(this);
		output.plugIn(this);
	}
	contains(x, y) {
		return this.path.some(e => e[0]/pside === x && e[1]/pside === y);
	}
	molecule(x, y) {
		return this.liquid.find((e, i) => this.path[i][0]/pside === x && this.path[i][1]/pside === y);
	}
	destroy() {
		if (this.immutable) return false;
		for (let [x, y] of this.path) {
			Pipe.mat[y/pside][x/pside]--;
			breakParticules(x/pside, y/pside, 1, pside, 0.1);
		}
		Pipe.list.remove(this);
		if (this.input) this.input.pipeOut.remove(this);
		if (this.output) this.output.pipeIn.remove(this);
		return true;
	}
	flow() {
		if (!this.persistent) return false;
		if (this.liquid[0] !== false) {
			if (this.output.push(this.liquid[0], this)) {
				if (!(this.output instanceof Distillation)) {
					new Particule(
						this.path[0][0]+4, this.path[0][1]+pside-2,
						3, R, G, B, 0.8,
						1, 1, 1, 1, 0.5,
						13*this.output.size, 0.08*rnd()-0.04, 0.2+0.2*rnd()
					);
				}
			} else {
				return false;
			}
		}
		this.liquid.shift(0);
		this.liquid.push(this.input.pump());
		return true;
	}
	draw(ctx) {
		let x, y, t;
		for (let i = 0 ; i < this.path.length ; i++) {
			[x, y, t] = this.path[i];
			if (this.liquid[i] === false)
				ctx.drawQuad(x, y, pside, pside, t, 0, 0, 0, 0);
			else
				ctx.drawQuad(x, y, pside, pside, t, full, R, G, B);
		}
	}
};
Pipe.last = true;
Pipe.list = [];
Pipe.mat = Array.from({length:row*5}, () => Array(col*5).fill(0));

Pipe.fromPoints = (x0, y0, x1, y1, persistent, tileOut, tileIn) => {
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

	let full = tileOut && tileIn && tileIn.anchor(mouse.px, mouse.py) === -1;
	let s0 = tileOut.size*5;
	let s1 = full ? tileIn.size*2 : 0;
	if (tileOut instanceof Distillation) {
		s0 = 2;
		if (py0 > 0) {
			oy += 1;
			path.push([0, -1]);
		}
	}
	if (py0 == 0) {
		oy += s0;
		y0 -= 1;
		path.push([0, -1-s0]);
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
			tmp = [0, 1+s1];
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
	return new Pipe(ox, oy, path, persistent, full && !persistent);
};

Pipe.searchAndCut = (x, y) => {
	console.log(Pipe.mat[y][x]);
	if (Pipe.mat[y][x] > 0) {
		for (let pipe of Pipe.list.reverse()) {
			if (pipe.contains(x, y) && pipe.destroy()) return true;
		}
	}
	return false;
};
Pipe.molecule = (x, y) => {
	let molecule;
	for (let pipe of Pipe.list) {
		molecule = pipe.molecule(x, y);
		if (molecule) return "\n"+molecule.print();
	}
	return "\n...";
}
