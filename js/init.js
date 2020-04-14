//MAIN VARIABLES
const main = document.getElementById("main");
const canvas = document.getElementById('myCan');
const slots = document.getElementById("slots");
const background = document.getElementById("background");

const side = 55;
const pside = side/5;
const xOffset = 0;
const yOffset = 0;
let row = 5;
let col = 10;
let rowH = row/2;
let colH = col/2;

let width = col*side;
let height = row*side;

const canvasScale = 1;
const full = 0.999;
const bigShelf = true;
const nbSlots = 5;

//DOM
let mouse;
for (let i = 0 ; i < nbSlots ; i++) {
	let slot = document.createElement("div");
	slot.setCount = function(count) {
		this.count = count;
		if (this.count === -1) {
			slot.slotCount.classList.remove("show");
			slot.slotCount.innerHTML = "";
		} else {
			slot.slotCount.classList.add("show");
			slot.slotCount.innerHTML = this.count;
		}
	}
	slot.use = function() {
		this.setCount(this.count--);
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

	if (i > 0) {
		slot.setCount(i);
	} else {
		slot.setCount(-1);
	}
}
const select = slot => {
	for (let i = 0 ; i < nbSlots ; i++) {
		slots.children[i].classList.remove("selected");
	}
	mouse.selected = slot;
	slots.children[slot].classList.add("selected");
}

//CANVAS AND WEBGL
canvas.width = width*canvasScale;
canvas.height = height*canvasScale;
const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: false});
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0, 0, 0, 0);

//UTILS
Array.prototype.sum = function() {return this.reduce((a, b) => a+b, 0);}
Array.prototype.last = function(x) {x = x || 0; return this[this.length-1-x];}
