const potion = e => e ? Array.from({length:e[0]}, _ => e[1].copy()) : [];

const matToList = (row, col, obj, size, shelf, level) => {
	list = [];
	for (let i = 0 ; i < col ; i++) {
		for (let j = 0 ; j < row ; j++) {
			if (obj[j][i]) {
				list.push([obj[j][i]-1, i, j, size[j][i]+1, shelf[j][i] === 1, level[j][i]]);
			} else if (shelf[j][i]) {
				list.push([3, i, j, size[j][i]+1]);
			}
		}
	}
	return list;
}

class Scene {
	constructor(name, row, col, objList, pipeList, slotList, narrative) {
		this.name = name;
		this.row = row;
		this.col = col;
		this.objList = objList;
		this.pipeList = pipeList;
		this.slotList = slotList;
		this.narrative = narrative;
	}
	load() {
		console.log("Loading scene", this.name);
		narrative.classList.remove("show");
		setDimensions(this.row, this.col);
		updateShaders();
		updateFbos();
		Tile.list = [];
		Tile.mat = Array.from({length: row}, () => Array(col));
		Pipe.last = true;
		Pipe.list = [];
		Pipe.mat = Array.from({length:row*5}, () => Array(col*5).fill(0));

		for (let [type, x, y, size, shelf, fill] of this.objList) {
			new Tile.types[type](x, y, size, shelf, potion(fill), true);
		}
		for (let pipe of this.pipeList) {
			let [X, Y, x, y] = pipe[0];
			new Pipe(X*5+x, Y*5+y, pipe.slice(1, pipe.length), true, false, true);
		}
		for (let slot = 0 ; slot < nbSlots ; slot++) {
			slots.children[slot].setCount(this.slotList[slot][0]);
			slots.children[slot].big = this.slotList[slot][1];
		}
		resize();
	}
	reset() {
		for (let i = 0 ; i < Tile.list.length ; i++) {
			let tile = Tile.list[i];
			if (tile instanceof Flask) {
				if (i < this.objList.length) {
					tile.empty();
					tile.liquid = potion(this.objList[i][5]);
				} else {
					tile.empty();
				}
				tile.updateLevel();
			}
		}
		for (let pipe of Pipe.list) {
			pipe.liquid = Array(pipe.liquid.length).fill(false);
		}
	}
}

class SceneManager {
	constructor(scenes) {
		this.frames = 0;
		this.physics = false;
		this.scenes = scenes;
		this.currentScene = -1;
		this.currentNarrative = 0;
		this.maxNarrative = 0;
		this.narrativeTimeout = 0;
		this.loop;
	}
	addScene(name, row, col, objList, pipeList, slotList, narrative) {
		this.scenes.push(new Scene(name, row, col, objList, pipeList, slotList, narrative));
	}
	start() {
		select(0);
		mouse.end({which:1, target:none});
		this.physics = true;
		for (let tile of Tile.list) {
			if (tile instanceof Spout) {
				tile.lit(true);
			} else if (tile instanceof Distillation) {
				tile.hot = false;
				tile.onFire();
			}
		}
	}
	stop() {
		this.physics = false;
		for (let tile of Tile.list)
			if (tile instanceof Spout)
				tile.lit(false);
	}
	reset() {
		this.stop();
		this.scenes[this.currentScene].reset();
		mouse.calculate(true);
	}
	loadScene(index) {
		clearInterval(this.loop);
		clearTimeout(this.narrativeTimeout);
		narrative.classList.remove("show");
		this.stop();
		this.currentScene = index;
		this.currentNarrative = -1;
		this.maxNarrative = this.scenes[index].narrative.length-1;
		this.scenes[index].load();
		this.loop = setInterval(render, 35);
		this.narrativeTimeout = setTimeout(() => this.nextNarrative(), second+1);
		mouse.calculate(true);
	}
	reload() {
		let physics = this.physics;
		this.stop();
		let start = Date.now();
		let user = confirm("Toutes les modifications seront supprimées.");
		let time = Date.now() - start;
		if (user || time < 10) {
			this.loadScene(this.currentScene);
		} else if (physics) {
			this.start();
		}
	}
	nextScene() {this.loadScene(this.currentScene+1);}
	nextNarrative() {
		if (this.currentNarrative < this.maxNarrative) {
			this.displayText(...this.scenes[this.currentScene].narrative[++this.currentNarrative]);
			return true;
		}
		return false;
	}
	previousNarrative() {
		if (this.currentNarrative > 0) {
			this.displayText(...this.scenes[this.currentScene].narrative[--this.currentNarrative]);
			return true;
		}
		return false;
	}
	displayText(text, top, bottom, right, left, width, height) {
		narrative.classList.remove("show");
		if (!text) return;
		top = getOrElse(top, none);
		bottom = getOrElse(bottom, none);
		right = getOrElse(right, none);
		left = getOrElse(left, none);
		width = getOrElse(width, "94%");
		height = getOrElse(height, "88%");
		narrative.style.top = top;
		narrative.style.bottom = bottom;
		narrative.style.right = right;
		narrative.style.left = left;
		narrative.style.width = width;
		narrative.style.height = height;
		narrative.innerHTML = text;
		narrative.classList.add("show");
	}
}


sceneManager = new SceneManager([]);

sceneManager.addScene(
	"SCENE_0",
	3, 6,
	[[0, 1, 1, 2, false, [192, r3]]],
	[],
	[[-1, true], [-1, true], [-1, true], [-1, true], [-1, true]],
	[]
);
sceneManager.addScene(
	"SCENE_1",

	5, 10,

	matToList(5, 10,
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,1,0,3,0,3,0,0],
	 [0,0,2,0,0,3,0,3,0,0],
	 [2,0,1,0,2,3,0,1,0,0],
	 [0,0,0,0,0,5,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0],
	 [1,0,1,0,0,0,0,1,0,0],
	 [0,0,0,0,0,0,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,1,0,1,0,0],
	 [0,0,0,1,0,1,0,1,0,0],
	 [0,0,1,0,0,1,0,1,0,0],
	 [0,0,0,0,1,1,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,[3,r2],0,0,0,0,0,0],
	 [0,0,[5,D],0,0,0,0,0,0,0],
	 [0,0,[96,r4],0,[18,V],[24,O],0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0]]),

	[[[3,1,2,4],[0,-5],[4,0],[0,15]],
	 [[5,1,2,2],[0,-5],[-4,0],[0,15]],
	 [[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]],

	[[-1, false], [3, true], [2, false], [9, true], [4, false]],

	[["Hello\nworld!", 0, none, none, 0, none, none],
	 ["This", 0, none, 0, none, none, none],
	 ["is", none, 0, 0, none, none, none],
	 ["a", none, 0, none, 0, none, none],
	 ["narrative!", 0, 0, 0, 0, none, none],
	 ["", 0, 0, 0, 0, 0, 0]]
);
