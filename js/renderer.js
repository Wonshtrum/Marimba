let va1 = new VertexArray([
	-1,-1,0,1,
	1,-1,1,1,
	1,1,1,0,
	-1,1,0,0],[2,2],gl.STATIC_DRAW);
//       0   1        2     3       4
//tex = [BG, SPRITES, main, bright, tempBlur]
let fbo1 = new FrameBuffer(width, height, 2, 2);
let fboBlur = [new FrameBuffer(canvas.width, canvas.height, 1, 4), new FrameBuffer(canvas.width, canvas.height, 1, 3, true)];
let b1 = new BatchVA(2000, ()=>{
	shaderBright.bind();
	fbo1.bind();
	gl.clear(gl.COLOR_BUFFER_BIT);
});

unbindAllFbo = FrameBuffer.prototype.unbind;

let obj = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,0,3,0,3,0,0],
	[0,0,2,0,0,3,0,3,0,0],
	[0,0,0,0,2,3,0,3,0,0],
	[0,0,0,0,0,5,0,0,0,0]]
let shaft = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,1,0,1,0,0],
	[0,0,0,1,0,1,0,1,0,0],
	[0,0,1,1,0,1,0,1,0,0],
	[0,0,1,1,1,1,0,1,0,0]]
let fill = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,.4,0,.7,0,0,0,0],
	[0,0,.2,0,0,.99,0,0,0,0],
	[0,0,0,0,.1,.99,0,0,0,0],
	[0,0,0,0,0,.9,0,0,0,0]]
R=0;
G=.8;
B=.75;
gl.clearColor(0,0,0,0);
let pside = 11;
let pipes = [
	[[3,1,2,4,0,30],[0,-5],[4,0],[0,15]],
	[[5,1,2,2,0,43],[0,-5],[-4,0],[0,15]],
	[[2,2,2,5,0,12],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]
];
const drawPipe = (pipe) => {
	let [x,y,xx,yy,fb,fe] = pipe[0];
	x = 5*x+xx;
	y = 5*y+yy;
	let dx, dy, ddx, ddy, f;
	f = 0;
	let fill = () => {f++; return f > fb && f <= fb+fe ? .99 : 0;}
	ddx = ddy = 0;
	for (let i = 1 ; i < pipe.length ; i++) {
		[dx,dy] = pipe[i];
		if (dx) {
			ddx = dx > 0 ? 1 : -1;
			if (i != 1)
				b1.drawQuad((x-25)*pside,(y-12.5)*pside,pside,pside,9-ddx+3*ddy,fill(),R,G,B);
			for (let j = ddx ; j != dx ; j+=ddx)
				b1.drawQuad((x+j-25)*pside,(y-12.5)*pside,pside,pside,6,fill(),R,G,B);
		} else {
			ddy = dy > 0 ? 1 : -1;
			if (i != 1)
				b1.drawQuad((x-25)*pside,(y-12.5)*pside,pside,pside,9+ddx-3*ddy,fill(),R,G,B);
			for (let j = ddy ; j != dy ; j+=ddy)
				b1.drawQuad((x-25)*pside,(y+j-12.5)*pside,pside,pside,8,fill(),R,G,B);
		}
		x += dx;
		y += dy;
	}
}
const render = () => {
	b1.bind();
	b1.begin();
	for (let i = 0 ; i < 10 ; i++) {
		for (let j = 0 ; j < 5 ; j++) {
			if (shaft[j][i])
				b1.drawQuad((i-5)*side,(j-2.5)*side,side,side,3,0,0,0,0);
		}
	}
	for (let pipe of pipes) {
		drawPipe(pipe);
		if (pipe[0][4]++>40) pipe[0][4]=-pipe[0][5];
	}
	for (let i = 0 ; i < 10 ; i++) {
		for (let j = 0 ; j < 5 ; j++) {
			if (obj[j][i] == 5)
				b1.drawQuad((i-5)*side,(j-2.5)*side,side,side,obj[j][i]-1,fill[j][i],0,0,0);
			else if (obj[j][i])
				b1.drawQuad((i-5)*side,(j-2.5)*side,side,side,obj[j][i]-1,fill[j][i],R,G,B);
		}
	}
	b1.drawQuad(Math.floor(mouse[0]/side)*side,(Math.floor(mouse[1]/side)+.5)*side,side,side,3,0,1,0,0);
	b1.drawQuad(-5*side,.5*side,side*2,side*2,1,0,R,G,B);
	b1.drawQuad(-3*side,.5*side,side*2,side*2,0,.4,R,G,B);
	b1.drawQuad(2*side,.5*side,side*2,side*2,0,0,R,G,B);
	b1.drawQuad(3*side,.5*side,side*2,side*2,4,0,0,0,0);
	b1.flush();
	
	for (let i = 0 ; i < 1 ; i++) {
		fboBlur[0].bind();
		shaderBlurH.bind();
		va1.draw();
		fboBlur[1].bind();
		shaderBlurV.bind();
		va1.draw();
	}

	unbindAllFbo();
	shaderTex.bind();
	va1.draw();
}

const start = () => {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,textures["sprites"]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D,textures["bg"]);

	setInterval(render, 30);
}

setTimeout(start,100);
