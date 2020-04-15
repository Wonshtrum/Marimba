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
	}
}

class SceneManager {
	constructor(scenes) {
		this.scenes = scenes;
		this.currentScene = 0;
		this.currentNarrative = -1;
		this.loop;
	}
	addScene(name, row, col, objList, pipeList, slotList, narrative) {
		this.scenes.push(new Scene(name, row, col, objList, pipeList, slotList, narrative));
	}
	clear() {
		clearInterval(this.loop);
	}
	loadScene(index) {
		this.clear();
		this.currentScene = index;
		this.currentNarrative = -1;
		this.scenes[index].load();
		this.loop = setInterval(render, 35);
	}
	reload() {this.loadScene(this.currentScene);}
	nextScene() {this.loadScene(this.currentScene+1);}
	nextNarrative() {
		console.log(this.scenes[this.currentScene].narrative[++this.currentNarrative]);
	}
}


sceneManager = new SceneManager([]);

sceneManager.addScene(
	"SCENE_0",
	3, 6,
	[],
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
	 [0,0,0,3,0,6,0,0,0,0],
	 [0,0,5,0,0,6,0,0,0,0],
	 [7,0,22,0,2,6,0,0,0,0],
	 [0,0,0,0,0,1,0,0,0,0]]),

	[[[3,1,2,4],[0,-5],[4,0],[0,15]],
	 [[5,1,2,2],[0,-5],[-4,0],[0,15]],
	 [[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]],

	[[-1, false], [3, true], [2, false], [9, true], [4, false]],

	["Hello",
	 "This",
	 "is",
	 "a",
	 "narrative!"]
);
