const floatSize = 4;
class VertexArray {
	constructor(buffer, layout, hint) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//CPU BUFFERS
		let totalSize = layout.sum();
		this.quadCount = buffer.length/(4*totalSize);
		this.vertexBuffer = new Float32Array(buffer);
		let indexBuffer = new Uint16Array(6*this.quadCount);
		let offset = 0;
		for (let i = 0 ; i < indexBuffer.length ; i += 6) {
			indexBuffer[i + 0] = offset + 0;
			indexBuffer[i + 1] = offset + 1;
			indexBuffer[i + 2] = offset + 2;

			indexBuffer[i + 3] = offset + 0;
			indexBuffer[i + 4] = offset + 2;
			indexBuffer[i + 5] = offset + 3;

			offset += 4;
		}

		//GPU BUFFERS
		this.vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, hint);
		this.ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

		//LAYOUT
		let stride = 0;
		for (let i = 0 ; i < layout.length ; i++) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, layout[i], gl.FLOAT, false, totalSize*floatSize, stride*floatSize);
			stride += layout[i];
		}
	}
	bind() {
		gl.bindVertexArray(this.va);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
	}
	draw() {
		this.bind();
		gl.drawElements(gl.TRIANGLES, 6*this.quadCount, gl.UNSIGNED_SHORT, 0);
	}
};

class BatchBase {
	constructor(maxQuad, onBind) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//BATCH
		this.maxQuad = maxQuad;
		this.quad = 0;
		this.dataIndex = 0;
		this.onBind = onBind;

		//CPU BUFFERS
		//[x, y, tex.fill, r, g, b]
		let layout = [2, 1, 3]
		let totalSize = layout.sum();
		this.vertexBuffer = new Float32Array(totalSize*4*maxQuad);
		//[tx, ty]
		let fixVertexBuffer = new Float32Array(2*4*maxQuad);
		for (let i = 0 ; i < fixVertexBuffer.length ; i+=8) {
			fixVertexBuffer[i + 0] = 0;
			fixVertexBuffer[i + 1] = 0;
			fixVertexBuffer[i + 2] = 1;
			fixVertexBuffer[i + 3] = 0;
			fixVertexBuffer[i + 4] = 1;
			fixVertexBuffer[i + 5] = 1;
			fixVertexBuffer[i + 6] = 0;
			fixVertexBuffer[i + 7] = 1;
		}
		let indexBuffer = new Uint16Array(6*maxQuad);
		let offset = 0;
		for (let i = 0 ; i < indexBuffer.length ; i+=6) {
			indexBuffer[i + 0] = offset + 0;
			indexBuffer[i + 1] = offset + 1;
			indexBuffer[i + 2] = offset + 2;

			indexBuffer[i + 3] = offset + 0;
			indexBuffer[i + 4] = offset + 2;
			indexBuffer[i + 5] = offset + 3;

			offset += 4;
		}

		//GPU BUFFERS
		this.fixVb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.fixVb);
		gl.bufferData(gl.ARRAY_BUFFER, fixVertexBuffer, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2*floatSize, 0);

		this.vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.DYNAMIC_DRAW);
		let stride = 0;
		for (let i = 0 ; i < layout.length ; i++) {
			gl.enableVertexAttribArray(i+1);
			gl.vertexAttribPointer(i+1, layout[i], gl.FLOAT, false, totalSize*floatSize, stride*floatSize);
			stride += layout[i];
		}

		this.ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);
	}
	bind() {
		gl.bindVertexArray(this.va);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		this.onBind();
	}
	begin() {
		this.quad = 0;
		this.dataIndex = 0;
	}
	drawQuad(x, y, w, h, t, f, r, g, b) {
		y -= 8;
		if (this.quad >= this.maxQuad) {
			this.flush();
			this.begin();
		}
		this.vertexBuffer[this.dataIndex + 0] = x;
		this.vertexBuffer[this.dataIndex + 1] = y;
		this.vertexBuffer[this.dataIndex + 2] = t+f;
		this.vertexBuffer[this.dataIndex + 3] = r;
		this.vertexBuffer[this.dataIndex + 4] = g;
		this.vertexBuffer[this.dataIndex + 5] = b;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x+w;
		this.vertexBuffer[this.dataIndex + 1] = y;
		this.vertexBuffer[this.dataIndex + 2] = t+f;
		this.vertexBuffer[this.dataIndex + 3] = r;
		this.vertexBuffer[this.dataIndex + 4] = g;
		this.vertexBuffer[this.dataIndex + 5] = b;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x+w;
		this.vertexBuffer[this.dataIndex + 1] = y+h;
		this.vertexBuffer[this.dataIndex + 2] = t+f;
		this.vertexBuffer[this.dataIndex + 3] = r;
		this.vertexBuffer[this.dataIndex + 4] = g;
		this.vertexBuffer[this.dataIndex + 5] = b;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x;
		this.vertexBuffer[this.dataIndex + 1] = y+h;
		this.vertexBuffer[this.dataIndex + 2] = t+f;
		this.vertexBuffer[this.dataIndex + 3] = r;
		this.vertexBuffer[this.dataIndex + 4] = g;
		this.vertexBuffer[this.dataIndex + 5] = b;
		this.dataIndex += 6;
		this.quad++;
	}
	flush() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexBuffer, 0, this.dataIndex);
		gl.drawElements(gl.TRIANGLES, 6*this.quad, gl.UNSIGNED_SHORT, 0);
	}
};

class BatchParticule {
	constructor(maxQuad, onBind) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//BATCH
		this.maxQuad = maxQuad;
		this.quad = 0;
		this.dataIndex = 0;
		this.onBind = onBind;

		//CPU BUFFERS
		//[x, y, r, g, b, a]
		let layout = [2, 4]
		let totalSize = layout.sum();
		this.vertexBuffer = new Float32Array(totalSize*4*maxQuad);
		let indexBuffer = new Uint16Array(6*maxQuad);
		let offset = 0;
		for (let i = 0 ; i < indexBuffer.length ; i+=6) {
			indexBuffer[i + 0] = offset + 0;
			indexBuffer[i + 1] = offset + 1;
			indexBuffer[i + 2] = offset + 2;

			indexBuffer[i + 3] = offset + 0;
			indexBuffer[i + 4] = offset + 2;
			indexBuffer[i + 5] = offset + 3;

			offset += 4;
		}

		//GPU BUFFERS
		this.vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffer, gl.DYNAMIC_DRAW);
		let stride = 0;
		for (let i = 0 ; i < layout.length ; i++) {
			gl.enableVertexAttribArray(i);
			gl.vertexAttribPointer(i, layout[i], gl.FLOAT, false, totalSize*floatSize, stride*floatSize);
			stride += layout[i];
		}

		this.ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);
	}
	bind() {
		gl.bindVertexArray(this.va);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
		this.onBind();
	}
	begin() {
		this.quad = 0;
		this.dataIndex = 0;
	}
	drawQuad(x, y, w, h, r, g, b, a) {
		y -= 8;
		if (this.quad >= this.maxQuad) {
			this.flush();
			this.begin();
		}
		this.vertexBuffer[this.dataIndex + 0] = x;
		this.vertexBuffer[this.dataIndex + 1] = y;
		this.vertexBuffer[this.dataIndex + 2] = r;
		this.vertexBuffer[this.dataIndex + 3] = g;
		this.vertexBuffer[this.dataIndex + 4] = b;
		this.vertexBuffer[this.dataIndex + 5] = a;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x+w;
		this.vertexBuffer[this.dataIndex + 1] = y;
		this.vertexBuffer[this.dataIndex + 2] = r;
		this.vertexBuffer[this.dataIndex + 3] = g;
		this.vertexBuffer[this.dataIndex + 4] = b;
		this.vertexBuffer[this.dataIndex + 5] = a;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x+w;
		this.vertexBuffer[this.dataIndex + 1] = y+h;
		this.vertexBuffer[this.dataIndex + 2] = r;
		this.vertexBuffer[this.dataIndex + 3] = g;
		this.vertexBuffer[this.dataIndex + 4] = b;
		this.vertexBuffer[this.dataIndex + 5] = a;
		this.dataIndex += 6;

		this.vertexBuffer[this.dataIndex + 0] = x;
		this.vertexBuffer[this.dataIndex + 1] = y+h;
		this.vertexBuffer[this.dataIndex + 2] = r;
		this.vertexBuffer[this.dataIndex + 3] = g;
		this.vertexBuffer[this.dataIndex + 4] = b;
		this.vertexBuffer[this.dataIndex + 5] = a;
		this.dataIndex += 6;
		this.quad++;
	}
	flush() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexBuffer, 0, this.dataIndex);
		gl.drawElements(gl.TRIANGLES, 6*this.quad, gl.UNSIGNED_SHORT, 0);
	}
};

class FrameBuffer {
	constructor(width, height, n, tex0) {
		this.tex0 = tex0 || 0;
		this.n = n;
		this.width = width;
		this.height = height;
		this.tex = Array(n);
		this.fbo = gl.createFramebuffer();
		this.attachments = Array.from({length:n}, (_,i)=>gl.COLOR_ATTACHMENT0+i);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		for (let i = 0 ; i < n ; i++) {
			gl.activeTexture(gl.TEXTURE0+i+this.tex0);
			this.tex[i] = defaultTex();
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, this.attachments[i], gl.TEXTURE_2D, this.tex[i], 0);
		}
	}
	bind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.drawBuffers(this.attachments);
		gl.viewport(0, 0, this.width, this.height);
		for (let i = 0 ; i < this.n ; i++) {
			gl.activeTexture(gl.TEXTURE0+i+this.tex0);
			gl.bindTexture(gl.TEXTURE_2D, this.tex[i]);
		}
	}
	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers([gl.BACK]);
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
};
const unbindAllFbo = FrameBuffer.prototype.unbind;

class Particule {
	constructor(x, y, s, r, g, b, a) {
		this.x = x;
		this.y = y;
		this.s = s;
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		this.ax = rnd()*0.02-0.01;
		this.ay = rnd()*0.02-0.01;
		this.vx = 0;
		this.vy = 0;
		Particule.list.push(this);
	}
	update() {
		this.vx += this.ax;
		this.vy += this.ay;
		this.x += this.vx;
		this.y += this.vy;
	}
	draw(ctx) {
		ctx.drawQuad(this.x, this.y, this.s, this.s, this.r, this.g, this.b, this.a);
	}
};
Particule.list = [];
