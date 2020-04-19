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
	constructor(name, row, col, objList, pipeList, slotList, narrative, completed) {
		this.completed = getOrElse(completed, false);
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
		Vessel.list = [];
		Pipe.last = true;
		Pipe.list = [];
		Pipe.mat = Array.from({length:row*5}, () => Array(col*5).fill(0));

		for (let [type, x, y, size, shelf, fill] of this.objList) {
			if (type === Vessel.id) {
				new Tile.types[type](x, y, size, shelf, fill, true);
			} else {
				new Tile.types[type](x, y, size, shelf, potion(fill), true);
			}
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
					if (!(tile instanceof Vessel)) {
						tile.liquid = potion(this.objList[i][5]);
					}
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
		this.scenes = getOrElse(scenes, []);
		this.currentScene = -1;
		this.currentNarrative = 0;
		this.maxNarrative = 0;
		this.narrativeTimeout = 0;
		this.loop;
		this.interupted = false;
	}
	addScene(name, row, col, objList, pipeList, slotList, narrative, completed) {
		this.scenes.push(new Scene(name, row, col, objList, pipeList, slotList, narrative, completed));
	}
	complete() {
		this.completed = !this.interupted && Vessel.list.every(e => e.completed);
		if (this.completed) alert("Bien joué !");
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
		this.interupted = true;
		this.physics = false;
		for (let tile of Tile.list)
			if (tile instanceof Spout)
				tile.lit(false);
	}
	reset() {
		this.stop();
		this.interupted = false;
		this.scenes[this.currentScene].reset();
		mouse.calculate(true);
	}
	loadScene(index) {
		clearInterval(this.loop);
		clearTimeout(this.narrativeTimeout);
		narrative.classList.remove("show");
		this.stop();
		this.interupted = false;
		this.currentScene = index;
		this.currentNarrative = -1;
		this.maxNarrative = this.scenes[index].narrative.length-1;
		this.scenes[index].load();
		this.completed = this.scenes[index].completed;
		this.loop = setInterval(render, 35);
		this.narrativeTimeout = setTimeout(() => this.nextNarrative(), second+1);
		mouse.calculate(true);
	}
	reload() {
		let physics = this.physics;
		this.stop();
		this.interupted = false;
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
		} else if (this.completed) {
			this.nextScene();
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


sceneManager = new SceneManager();
