//MAIN VARIABLES
const canvas = document.getElementById('myCan');
const side = 55;
const pside = side/5;

let row = 5;
let col = 10;
let rowH = row/2;
let colH = col/2;

let width = col*side;
let height = row*side;

const canvasScale = 1;

const full = 0.999;
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
