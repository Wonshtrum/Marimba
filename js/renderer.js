let va1 = new VertexArray([
	-1,-1,0,1,
	1,-1,1,1,
	1,1,1,0,
	-1,1,0,0],[2,2],gl.STATIC_DRAW);
//       0   1        2     3       4
//tex = [BG, SPRITES, main, bright, tempBlur]
let fbo1 = new FrameBuffer(width, height, 2, 2);
let fboBlur = [new FrameBuffer(canvas.width, canvas.height, 1, 4), new FrameBuffer(canvas.width, canvas.height, 1, 3, true)];
let b1 = new BatchVA(2000, ()=>{shaderBright.bind(), fbo1.bind()});

unbindAllFbo = FrameBuffer.prototype.unbind;

const render = () => {
	b1.begin();
	for (let i = -5 ; i < 5 ; i++) {
		for (let j = -2.5 ; j < 2.5 ; j++) {
			b1.drawQuad(i*side,j*side,side,side,(i+5)%5,0.3,0,1,.5);
		}
	}
	b1.flush();
	
	for (let i = 0 ; i < 3 ; i++) {
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

	setInterval(render, 50);
}

setTimeout(start,100);
