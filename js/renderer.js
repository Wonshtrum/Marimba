let va1 = new VertexArray([0,0,0,1,1,1,1,0],[2],gl.STATIC_DRAW);
let va2 = new VertexArray([0,0,0,1,1,1,0,0],[2],gl.STATIC_DRAW);

shader1.bind();
va1.draw();

let fbo1 = new FrameBuffer(10,10,2);
shader2.bind();
va2.draw();

fbo1.unbind();
shader3.bind();
gl.uniform1iv(shader3.uniforms.u_tex, [0,1]);
va1.draw();
