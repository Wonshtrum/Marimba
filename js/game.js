let clamp = function(x, a, b) {
	return a>x?a:b<x?b:x;
};

let xyOnMapPixel = function(e) {
	let x = Math.floor(width*(e.x-canvas.offsetLeft)/canvas.offsetWidth);
	let y = Math.floor(height*(e.y-canvas.offsetTop)/canvas.offsetHeight);
	return [Math.floor(x), Math.floor(y)];
};

let xyOnMap = function(e) {
	let [x, y] = xyOnMapPixel(e);
	x = Math.floor(x/side);
	y = Math.floor(y/side);
	return [clamp(x, 0, map.w-1), clamp(y, 0, map.h-1)];
};

let mouse = [0, 0];
canvas.onmousemove = function(e) {
	let [x, y] = xyOnMapPixel(e);
	mouse = [x-5*side, y-3*side+8];
}
