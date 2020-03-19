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
			let uniform = it.value[0].match(/u_[^ []*/g);
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

const baseVertCode =
	`#version 300 es
	layout(location = 0) in vec2 a_position;
	layout(location = 1) in vec2 a_texCoord;
	uniform vec2 u_screen;
	out vec2 v_position;
	out vec2 v_texCoord;

	void main() {
		gl_Position = vec4(a_position.x/u_screen.x, a_position.y/u_screen.y, 1, 1);
		v_position = gl_Position.xy;
		v_texCoord = a_texCoord;
	}`
const shader1 = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	out vec4 fragColor;

	void main() {
		fragColor = vec4(1,0,0,1);
	}
	`
);

const shader2 = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	layout(location = 0) out vec4 fragColor0;
	layout(location = 1) out vec4 fragColor1;

	void main() {
		fragColor0 = vec4(0,1,0,1);
		fragColor1 = vec4(0,0,1,1);
	}
	`
);

const shader3 = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	uniform sampler2D u_tex[2];
	in vec2 v_texCoord;
	out vec4 fragColor;

	void main() {
		fragColor = texture(u_tex[0], v_texCoord)+texture(u_tex[1], v_texCoord);
	}
	`
);

const shader4 = new Shader(
	//VERTEX SHADER CODE
	`#version 300 es
	layout(location = 0) in vec2 a_texCoord;
	layout(location = 1) in vec2 a_position;
	layout(location = 2) in float a_fill;
	layout(location = 3) in vec3 a_color;
	uniform vec2 u_screen;

	out vec2 v_position;
	out vec2 v_texCoord;
	out float v_fill;
	out vec3 v_color;

	void main() {
		gl_Position = vec4(a_position.x/u_screen.x, a_position.y/u_screen.y, 1, 1);
		v_position = gl_Position.xy;
		v_texCoord = a_texCoord;
		v_fill = a_fill;
		v_color = a_color;
	}`,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	in vec2 v_position;
	in vec2 v_texCoord;
	in float v_fill;
	in vec3 v_color;
	uniform sampler2D u_tex;
	
	layout(location = 0) out vec4 baseColor;
	layout(location = 1) out vec4 brightColor;

	void main() {
		baseColor = texture(u_tex, v_texCoord);
		brightColor = vec4(v_color, 1);
	}`
)
	

for (let shader of [shader1, shader2, shader3]) {
	shader.bind();
	gl.uniform2f(shader.uniforms.u_screen, 1, 1);
}
shader3.bind();
gl.uniform1iv(shader3.uniforms.u_tex, [1,2]);

shader4.bind();
gl.uniform2f(shader4.uniforms.u_screen, width, height);
gl.uniform2f(shader4.uniforms.u_screen, width, height);
