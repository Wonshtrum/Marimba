let va1 = new VertexArray([
	-1,-1,0,1,
	1,-1,1,1,
	1,1,1,0,
	-1,1,0,0],[2,2],gl.STATIC_DRAW);
let fbo1 = new FrameBuffer(width, height, 2, 1);
let fboBlur = [new FrameBuffer(canvas.width, canvas.height, 1, 3), new FrameBuffer(canvas.width, canvas.height, 1, 2, true)];
let b1 = new BatchVA(2000, ()=>{shaderBright.bind(), fbo1.bind()});

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D,textures["kirby"]);

unbindAllFbo = FrameBuffer.prototype.unbind;

const render = () => {
	b1.begin();
	for (let i = 0 ; i < 10000 ; i++) {
		b1.drawQuad(-i/100,-i/100,50,50,.5,.8,0,.9);
	}
	b1.flush();
	
	for (let i = 0 ; i < 4 ; i++) {
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

setInterval(render, 50);
