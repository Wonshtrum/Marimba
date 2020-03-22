//INITIALISATION
const canvas = document.getElementById('myCan');
let side = 55;
let pside = side/5;

let row = 5;
let col = 10;
let rowH = row/2;
let colH = col/2;

let width = col*side;
let height = row*side;

let canvasScale = 1;

canvas.width = width*canvasScale;
canvas.height = height*canvasScale;
const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: false});
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0, 0, 0, 0);
