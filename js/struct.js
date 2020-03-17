const floatSize = 4;
class VertexArray {
	constructor(buffer, layout, hint) {
		//VERTEX ARRAY
		this.va = gl.createVertexArray();
		gl.bindVertexArray(this.va);

		//CPU BUFFERS
		let totalSize = layout.reduce((a,b)=>a+b,0);
		this.quadCount = buffer.length/(4*totalSize);
		this.vertexBuffer = new Float32Array(buffer);
		let indexBuffer = new Uint16Array(6*this.quadCount);
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
		//gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib)
	}
	draw() {
		this.bind();
		gl.drawElements(gl.TRIANGLES, 6*this.quadCount, gl.UNSIGNED_SHORT, 0);
	}
}

class FrameBuffer {
	constructor(width, height, n) {
		this.width = width;
		this.height = height;
		this.tex = Array(n);
		this.fbo = gl.createFramebuffer();
		this.attachments = Array.from({length:n}, (_,i)=>gl.COLOR_ATTACHMENT0+i);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		for (let i = 0 ; i < n ; i++) {
			gl.activeTexture(gl.TEXTURE0+i);
			this.tex[i] = defaultTex();
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, this.attachments[i], gl.TEXTURE_2D, this.tex[i], 0);
		}
		this.bind();
	}
	bind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.drawBuffers(this.attachments);
		gl.viewport(0, 0, this.width, this.height);
	}
	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers([gl.BACK]);
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
}
