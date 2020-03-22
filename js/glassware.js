class Tile {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
	}
}

class Flask extends Tile {
	constructor(x, y, size, level, R, G, B) {
		super(x, y, size);
		this.level = level;
		this.fill = fill;
		this.R = R;
		this.G = G;
		this.B = B;
	}
	fill(level) {
		this.fill = Math.max(level, 0.999);
	}
}

class Erlenmeyer extends Flask {
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.fill, this.R, this.G, this.B);
	}
}

class Bescher extends Flask {
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 1, this.fill, this.R, this.G, this.B);
	}
}

class Distillation extends Flask {
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 2, this.fill, this.R, this.G, this.B);
	}
}

class Shelf extends Tile {
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 3, 0, 0, 0, 0);
	}
}

class Spout extends Tile {
	constructor(x, y, size, lit) {
		super(x, y, size);
		this.lit = lit;
	}
	draw(ctx) {
		ctx.drawQuad(this.x*side, this.y*side, this.size*side, this.size*side, 0, this.fill, this.R, this.G, this.B);
	}
}

class Pipe {
	constructor(x, y, path) {
		this.path = [];
		let X = colH*5;
		let Y = rowH*5;
		let dx, dy, ddx, ddy;
		ddx = ddy = 0;
		for (let i = 0 ; i < path.length ; i++) {
			[dx, dy] = path[i];
			if (dx) {
				ddx = dx > 0 ? 1 : -1;
				if (i != 1)
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
	}
	draw(ctx) {
		for (let [x, y, t] of this.path)
			ctx.drawQuad(this.x*pside, this.y*pside, pside, pside, t, 0, 0, 0, 0);
	}
}
