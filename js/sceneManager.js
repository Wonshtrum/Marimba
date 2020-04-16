const matToList = (row, col, obj, size, shelf, fill) => {
	list = [];
	for (let i = 0 ; i < col ; i++) {
		for (let j = 0 ; j < row ; j++) {
			if (obj[j][i])
				list.push([obj[j][i]-1, i, j, size[j][i]+1, shelf[j][i] === 1, fill[j][i]]);
			else if (shelf[j][i])
				list.push([3, i, j, size[j][i]+1]);
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
			new Tile.types[type](x, y, size, shelf, fill, true);
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
}

class SceneManager {
	constructor(scenes) {
		this.scenes = scenes;
		this.currentScene = -1;
		this.currentNarrative = 0;
		this.maxNarrative = 0;
		this.loop;
	}
	addScene(name, row, col, objList, pipeList, slotList, narrative) {
		this.scenes.push(new Scene(name, row, col, objList, pipeList, slotList, narrative));
	}
	clear() {
		clearInterval(this.loop);
		narrative.classList.remove("show");
	}
	loadScene(index) {
		this.clear();
		this.currentScene = index;
		this.currentNarrative = -1;
		this.maxNarrative = this.scenes[index].narrative.length-1;
		this.scenes[index].load();
		this.loop = setInterval(render, 35);
		setTimeout(() => this.nextNarrative(), second+1);
	}
	reload() {this.loadScene(this.currentScene);}
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
	[[0,1,1,2,false,192]],
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
	 [0,0,0,3,0,12,0,0,0,0],
	 [0,0,5,0,0,24,0,0,0,0],
	 [0,0,96,0,18,24,0,0,0,0],
	 [0,0,0,0,0,1,0,0,0,0]]),

	[[[3,1,2,4],[0,-5],[4,0],[0,15]],
	 [[5,1,2,2],[0,-5],[-4,0],[0,15]],
	 [[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]],

	[[-1, false], [3, true], [2, false], [9, true], [4, false]],

	[["Hello\nici", 0, none, none, 0, none, none],
	 ["This", 0, none, 0, none, none, none],
	 ["is", none, 0, 0, none, none, none],
	 ["a", none, 0, none, 0, none, none],
	 ["narrative!", 0, 0, 0, 0, none, none],
	 ["", 0, 0, 0, 0, 0, 0]]
);
