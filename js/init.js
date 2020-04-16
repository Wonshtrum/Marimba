//GLOBAL VARIABLES
//constants
const side = 55;
const pside = side/5;
const xOffset = 0;
const yOffset = 0;
const full = 0.999;
const bigShelf = true;
const particulesPerSize = 10;
const usesPerSize = 1;
const nbSlots = 5;
const none = "";
const second = 1000;
const levelBase = 24;

//global variables used for scale
let row, col, rowH, colH, width, height;
const setDimensions = (newRow, newCol) => {
	row = newRow;
	col = newCol;
	rowH = row/2;
	colH = col/2;
	width = col*side;
	height = row*side;
	canvas.width = width;
	canvas.height = height;
}

//DOM
const main = document.getElementById("main");
const canvas = document.getElementById('myCan');
const slots = document.getElementById("slots");
const background = document.getElementById("background");
const narrative = document.getElementById("narrative");
setDimensions(1, 1);

//create the inventory slots and link them to the mouse
let mouse;
for (let i = 0 ; i < nbSlots ; i++) {
	let slot = document.createElement("div");
	slot.count = 0;
	slot.size = 1;
	slot.big = false;
	slot.setCount = function(count) {
		this.count = count;
		if (this.count < 0) {
			slot.slotCount.classList.remove("show");
			slot.slotCount.innerHTML = "";
		} else {
			slot.slotCount.classList.add("show");
			slot.slotCount.innerHTML = this.count;
		}
	}
	slot.use = function(times) {
		if (this.count < 0) return;
		times = times || 1;
		this.setCount(this.count-times);
	}
	slot.get = function(times) {
		if (this.count < 0) return;
		times = times || 1;
		this.setCount(this.count+times);
	}
	slot.classList.add("slot");
	slot.onclick = () => select(i);
	slots.appendChild(slot);

	let img = document.createElement("img");
	img.classList.add("centered");
	img.src = "img/slots.png";
	img.style.objectPosition = 100*i/(nbSlots-1)+"% 0";
	img.ondragstart = () => false;
	slot.appendChild(img);

	let slotCount = document.createElement("div");
	slotCount.classList.add("count");
	slot.appendChild(slotCount);
	slot.slotCount = slotCount;
}
const select = slot => {
	for (let i = 0 ; i < nbSlots ; i++) {
		slots.children[i].classList.remove("selected");
	}
	if (slots.children[slot].count === 0) {
		slot = 0;
	}
	mouse.size = slots.children[slot].size;
	mouse.selected = slot;
	mouse.calculate();
	slots.children[slot].classList.add("selected");
}

//CANVAS AND WEBGL
//canvas.width = width;
//canvas.height = height;
const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: false});
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0, 0, 0, 0);

//UTILS
Array.prototype.sum = function() {return this.reduce((a, b) => a+b, 0);}
Array.prototype.last = function(x) {x = x || 0; return this[this.length-1-x];}
Array.prototype.copy = function() {return this.slice(0, this.length);}
Array.prototype.remove = function(e) {
	let index = this.indexOf(e);
	if (index !== -1) {
		this.splice(index, 1);
		return true;
	}
	return false;
}
const getOrElse = (value, orElse) => value === undefined ? orElse : value;
const rnd = Math.random;
