let va1 = new VertexArray([0,0,0,1,1,1,1,0],[2],gl.STATIC_DRAW);
let va2 = new VertexArray([0,0,0,1,1,1,0,0],[2],gl.STATIC_DRAW);
let fbo1 = new FrameBuffer(10,10,2);
let fbo2 = new FrameBuffer(100,100,3);
fbo2.unbind();

const render = () => {
	shader1.bind();
	va1.draw();


	fbo1.bind();
	shader2.bind();
	va2.draw();

	fbo1.unbind();
	shader3.bind();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,textures["kirby"]);
	gl.uniform1iv(shader3.uniforms.u_tex, [0,1]);
	va1.draw();
}
