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
};

const baseVertCode =
	`#version 300 es
	layout(location = 0) in vec2 a_position;
	layout(location = 1) in vec2 a_texCoord;
	uniform vec2 u_screen;
	out vec2 v_position;
	out vec2 v_texCoord;

	void main() {
		gl_Position = vec4(a_position.x/u_screen.x-1.0, a_position.y/u_screen.y-1.0, 1, 1);
		v_position = gl_Position.xy;
		v_texCoord = a_texCoord;
	}`;

const shaderTex = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	uniform sampler2D u_tex[3];
	in vec2 v_texCoord;
	out vec4 fragColor;

	void main() {
		vec4 bg = texture(u_tex[0], v_texCoord);
		vec4 base = texture(u_tex[1], v_texCoord);
		vec4 bright = texture(u_tex[2], v_texCoord);
		fragColor = vec4(base.rgb*base.a + bg.rgb*(1.0-base.a), 1)+bright;
	}
	`
);

const shaderBright = new Shader(
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
		gl_Position = vec4(a_position.x/u_screen.x-1.0, a_position.y/u_screen.y-1.0, 1, 1);
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
		int type = int(v_fill);
		vec2 texCoord = v_texCoord;
		if (type >= 5) {
			type -= 5;
			texCoord = (texCoord+vec2(type%3, type/3))/5.0;
			type = 5;
		}
		vec2 sprite = vec2(0, type);
		if (1.0-v_texCoord.y < fract(v_fill)) {
			sprite.x = 1.0;
			brightColor = vec4(v_color, 1);
		}
		baseColor = texture(u_tex, (sprite+texCoord)*vec2(0.5, 1.0/6.0));
		brightColor = vec4(0);
		if (sprite.x == 1.0 && baseColor.a != 0.0) {
			brightColor = vec4(v_color, 1);
		}
		if (baseColor == vec4(0, 1, 0, 1)) {
			baseColor = vec4(1, 1, 1, 0.5);
		} else if (type != 3 && 0.3*baseColor.r+0.59*baseColor.g+0.11*baseColor.b > 0.6) {
			brightColor = baseColor;
		}
	}`
);

const shaderBlurH = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	in vec2 v_position;
	in vec2 v_texCoord;
	uniform sampler2D u_tex;
	
	out vec4 fragColor;

	void main() {
		float w[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
		vec2 pixel = vec2(1)/vec2(textureSize(u_tex, 0));
		pixel.y = 0.0;
		vec3 color = texture(u_tex, v_texCoord).rgb*w[0];
		for (int i = 1 ; i < 5 ; i++) {
			color += texture(u_tex, v_texCoord+pixel*float(i)).rgb*w[i];
			color += texture(u_tex, v_texCoord-pixel*float(i)).rgb*w[i];
		}
		fragColor = vec4(color, 1.0);
	}`
);
const shaderBlurV = new Shader(
	//VERTEX SHADER CODE
	baseVertCode,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	in vec2 v_position;
	in vec2 v_texCoord;
	uniform sampler2D u_tex;
	
	out vec4 fragColor;

	void main() {
		float w[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
		vec2 pixel = vec2(1)/vec2(textureSize(u_tex, 0));
		pixel.x = 0.0;
		vec3 color = texture(u_tex, v_texCoord).rgb*w[0];
		for (int i = 1 ; i < 5 ; i++) {
			color += texture(u_tex, v_texCoord+pixel*float(i)).rgb*w[i];
			color += texture(u_tex, v_texCoord-pixel*float(i)).rgb*w[i];
		}
		fragColor = vec4(color, 1.0);
	}`
);

const shaderParticule = new Shader(
	//VERTEX SHADER CODE
	`#version 300 es
	layout(location = 0) in vec2 a_position;
	layout(location = 1) in vec4 a_color;
	uniform vec2 u_screen;

	out vec4 v_color;

	void main() {
		gl_Position = vec4(a_position.x/u_screen.x-1.0, a_position.y/u_screen.y-1.0, 1, 1);
		v_color = a_color;
	}`,
	//FRAGMENT SHADER CODE
	`#version 300 es
	precision mediump float;
	in vec4 v_color;
	
	layout(location = 0) out vec4 baseColor;
	layout(location = 1) out vec4 brightColor;

	void main() {
		baseColor = v_color;
		brightColor = vec4(v_color.rgb, 1);
	}`
);

	

shaderTex.bind();
gl.uniform2f(shaderTex.uniforms.u_screen, 1, 1);
gl.uniform1iv(shaderTex.uniforms.u_tex, [1, 2, 3]);

shaderBright.bind();
gl.uniform1i(shaderBright.uniforms.u_tex, 0);
gl.uniform2f(shaderBright.uniforms.u_screen, width/2, height/2);

shaderBlurH.bind();
gl.uniform2f(shaderBlurH.uniforms.u_screen, 1, 1);
gl.uniform1i(shaderBlurH.uniforms.u_tex, 3);
shaderBlurV.bind();
gl.uniform2f(shaderBlurV.uniforms.u_screen, 1, 1);
gl.uniform1i(shaderBlurV.uniforms.u_tex, 4);

shaderParticule.bind();
gl.uniform2f(shaderParticule.uniforms.u_screen, width/2, height/2);
