class Shader {
	constructor(vertCode, fragCode) {
		//VERTEX SHADER
		this.vertShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(this.vertShader, vertCode);
		gl.compileShader(this.vertShader);

		//FRAGMENT SHADER
		this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(this.fragShader, fragCode);
		gl.compileShader(this.fragShader);

		//SHADER PROGRAM
		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertShader);
		gl.attachShader(this.program, this.fragShader);
		gl.linkProgram(this.program);
		gl.useProgram(this.program);

		//UNIFORMS
		this.uniforms = {};
		this.getUniforms(vertCode);
		this.getUniforms(fragCode);
	}
	getUniforms(code) {
		let regex = code.matchAll(/uniform [^;]*/g);
		while (true) {
			let it = regex.next();
			if (it.done) break;
			let uniform = it.value[0].match(/u_[^ ]*/g);
			this.uniforms[uniform] = gl.getUniformLocation(this.program, uniform);
		}
	}
	bind() {
		gl.useProgram(this.program);
	}
	unbind() {
		gl.useProgram(0);
	}
}

const shader1 = new Shader(
	//VERTEX SHADER CODE
	`#version 300 es
	layout(location = 0) in vec2 a_position;
	uniform vec2 u_screen;

	void main() {
		gl_Position = vec4(a_position.x/u_screen.x, a_position.y/u_screen.y, 1, 1);
	}
	`,

	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	out vec4 fragColor;

	void main() {
		fragColor = vec4(1,0,0,1);
	}
	`
);
gl.uniform2f(shader1.uniforms.u_screen, 2, 2);
