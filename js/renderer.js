let va1 = new VertexArray([
	-1, -1, 0, 1,
	 1, -1, 1, 1,
	 1,  1, 1, 0,
	-1,  1, 0, 0], [2, 2], gl.STATIC_DRAW);

//       0   1        2     3       4
//tex = [BG, SPRITES, main, bright, tmpBlur]
let fbo1 = new FrameBuffer(width, height, 2, 2);

let fboBlur = [new FrameBuffer(canvas.width, canvas.height, 1, 4), new FrameBuffer(canvas.width, canvas.height, 1, 3)];

let b1 = new BatchVA(2000, ()=>{
	shaderBright.bind();
	fbo1.bind();
	gl.clear(gl.COLOR_BUFFER_BIT);
});

let dR = 0.01;
let dG = 0.025;
let dB = 0.03;
let f = 0;
const render = () => {
	f++
	R += dR;
	G += dG;
	B += dB;
	if (R>1 || R<0) dR*=-1;
	if (G>1 || G<0) dG*=-1;
	if (B>1 || B<0) dB*=-1;

	b1.bind();
	b1.begin();
	for (let pipe of Pipe.list) {
		if (Math.random()>0.95)
			pipe.push(Math.ceil(Math.random()*5));
		pipe.flow();
		pipe.draw(b1);
	}
	for (let tile of Tile.list)
		tile.draw(b1);
	b1.drawQuad(Math.floor(mouse[0]/side)*side, (Math.floor(mouse[1]/side)+.5)*side, side, side, 3, 0, 1, 0, 0);
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
	gl.bindTexture(gl.TEXTURE_2D, textures["sprites"]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures["bg"]);

	setInterval(render, 30);
}

setTimeout(start, 100);
