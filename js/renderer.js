let va1 = new VertexArray([
	0, 0, 0, 1,
	2, 0, 1, 1,
	2, 2, 1, 0,
	0, 2, 0, 0], [2, 2], gl.STATIC_DRAW);

//       0   1        2     3       4
//tex = [BG, SPRITES, main, bright, tmpBlur]
fboBase = new FrameBuffer(width, height, 2, 2);
fboBlur = [new FrameBuffer(canvas.width, canvas.height, 1, 4), new FrameBuffer(canvas.width, canvas.height, 1, 3)];
const updateFbos = () => {
	fboBase.resize(width, height);
	fboBlur[0].resize(width, height);
	fboBlur[1].resize(width, height);
}

let bBase = new BatchBase(2000, ()=>{
	shaderBright.bind();
	fboBase.bind();
	gl.clear(gl.COLOR_BUFFER_BIT);
});
let bParticule = new BatchParticule(2000, ()=>{
	shaderParticule.bind();
	fboBase.bind();
});

let R = 0;
let G = 0.8;
let B = 0.75;
let dR = 0.01;
let dG = 0.025;
let dB = 0.03;
let d = 10;
for (let i = 0 ; i < 0 ; i++)
	new Particule(rnd()*d, rnd()*d, 1, rnd(), rnd(), rnd(), 0.8, 20, rnd(), rnd(), rnd(), 0, 200, 0.1*rnd(), 0.1*rnd());

const render = () => {
	sceneManager.frames++;
	R += dR;
	G += dG;
	B += dB;
	if (R>1 || R<0) dR*=-1;
	if (G>1 || G<0) dG*=-1;
	if (B>1 || B<0) dB*=-1;

	bBase.bind();
	bBase.begin();
	mouse.drawRect(bBase);

	for (let pipe of Pipe.list) {
		if (sceneManager.physics) pipe.flow();
		pipe.draw(bBase);
	}
	for (let tile of Tile.list)
		tile.draw(bBase);

	mouse.draw(bBase);
	bBase.flush();
	
	bParticule.bind();
	bParticule.begin();
	for (let particule of Particule.list.copy()) {
		particule.update();
		particule.draw(bParticule);
	}
	bParticule.flush();
	
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
	gl.bindTexture(gl.TEXTURE_2D, textures["sprites"]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures["bg"]);
	sceneManager.loadScene(1);
}

//WAIT FOR TEXTURES TO BE LOADED
setTimeout(start, 100);
