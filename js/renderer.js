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

const render = () => {
	b1.bind();
	b1.begin();
	for (let pipe of Pipe.list)
		pipe.draw(b1);
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
