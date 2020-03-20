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
G=.6;
B=.45;
gl.clearColor(0,0,0,1);
const render = () => {
	b1.begin();
	for (let i = 0 ; i < 10 ; i++) {
		for (let j = 0 ; j < 5 ; j++) {
			if (obj[j][i])
				b1.drawQuad((i-5)*side,(j-2.5)*side,side,side,obj[j][i]-1,fill[j][i],R,G,B);
			if (shaft[j][i])
				b1.drawQuad((i-5)*side,(j-2.5)*side,side,side,3,0,0,0,0);
		}
	}
	b1.drawQuad(mouse[0],mouse[1],side,side,0,.1,1,0,0);
	b1.drawQuad(-5*side,.5*side,side*2,side*2,1,.01,R,G,B);
	b1.drawQuad(-3*side,.5*side,side*2,side*2,0,.4,R,G,B);
	b1.drawQuad(2*side,.5*side,side*2,side*2,0,.01,R,G,B);
	b1.drawQuad(3*side,.5*side,side*2,side*2,4,0,0,0,0);
	b1.flush();
	
	for (let i = 0 ; i < 2 ; i++) {
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
