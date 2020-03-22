let clamp = function(x, a, b) {
	return a > x ? a:b < x ? b : x;
};

let xyOnCanvas = function(e) {
	let x = Math.floor(width*(e.x-canvas.offsetLeft)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvas.offsetTop)/canvas.offsetHeight);
	return [Math.floor(x), Math.floor(y)];
};

let mouse = [0, 0];
canvas.onmousemove = function(e) {
	let [x, y] = xyOnCanvas(e);
	mouse = [x-5*side, y-3*side+8];
}
