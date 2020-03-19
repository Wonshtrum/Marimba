let va1 = new VertexArray([
	-1,-1,0,0,
	-1,1,0,1,
	1,1,1,1,
	1,-1,1,0],[2,2],gl.STATIC_DRAW);
let va2 = new VertexArray([
	0,0,0,0,
	0,1,0,1,
	1,1,1,1,
	0,0,0,0],[2,2],gl.STATIC_DRAW);
let fbo1 = new FrameBuffer(width, height, 2, 1);
fbo1.unbind();
let b1 = new BatchVA(1000, ()=>{shader4.bind(), fbo1.bind()});

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D,textures["kirby"]);

const render = () => {
	/*shader1.bind();
	va1.draw();

	fbo1.bind();
	shader2.bind();
	va2.draw();*/
	for (let i = 0 ; i < 10000 ; i++) {
		b1.drawQuad(i/100,i/100,100,100,.5,.8,0,.9);
	}

	b1.flush();
	fbo1.unbind();
	shader3.bind();
	va1.draw();
}

setInterval(render, 50);
