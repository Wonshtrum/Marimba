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


canvas.onmousemove = function(e) {
	let [x, y] = xyOnMapPixel(e);
	let n = 0;
	lights[n][0] = x-width/2;
	lights[n][1] = height/2-y;
	gl.uniform3fv(uLights, lights.flat());
}
