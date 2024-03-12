const OS_FILTER_RANGE = [0, 2];
const OS_FILTER_LIGHTNESS = 1;
const O2_FILTER_RANGE = [2, 256];
const O2_FILTER_LIGHTNESS = 1;
const EMBOSS_FILTER_AMOUNT = 1;
const SHARPEN_FILTER_AMOUNT = 2;

const FRAGMENT_IDENTITY = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D texture;
    uniform float flipY;
    void main(void) {
        gl_FragColor = texture2D(texture, vec2(vUv.x, flipY * vUv.y));
    }`;

/**
 * Represents a WebGL program used for image filtering.
 */
export class WebGLProgram {
  constructor(gl, vertexSource, fragmentSource) {
    const _collect = function (source, prefix, collection) {
      const r = new RegExp("\\b" + prefix + " \\w+ (\\w+)", "ig");
      source.replace(r, function (match, name) {
        collection[name] = 0;
        return match;
      });
    };

    const _compile = (gl, source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    this.uniform = {};
    this.attribute = {};

    const _vsh = _compile(gl, vertexSource, gl.VERTEX_SHADER);
    const _fsh = _compile(gl, fragmentSource, gl.FRAGMENT_SHADER);

    this.id = gl.createProgram();
    gl.attachShader(this.id, _vsh);
    gl.attachShader(this.id, _fsh);
    gl.linkProgram(this.id);

    if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(this.id));
    }

    gl.useProgram(this.id);

    // Collect attributes
    _collect(vertexSource, "attribute", this.attribute);
    for (const a in this.attribute) {
      this.attribute[a] = gl.getAttribLocation(this.id, a);
    }

    // Collect uniforms
    _collect(vertexSource, "uniform", this.uniform);
    _collect(fragmentSource, "uniform", this.uniform);
    for (const u in this.uniform) {
      this.uniform[u] = gl.getUniformLocation(this.id, u);
    }
  }
}

/**
 * Represents a WebGL image filter.
 * @constructor
 * @param {Object} params - The parameters for the WebGLImageFilter.
 * @param {HTMLCanvasElement} [params.canvas] - The canvas element to use for rendering.
 */
/**
 * Represents a WebGLImageFilter used for applying image filters using WebGL.
 */
export class WebGLImageFilter {
  _gl = null;
  _drawCount = 0;
  _sourceTexture = null;
  _lastInChain = false;
  _currentFramebufferIndex = -1;
  _tempFramebuffers = [null, null];
  _filterChain = [];
  _width = -1;
  _height = -1;
  _vertexBuffer = null;
  _currentProgram = null;

  constructor(params) {
    if (!params) params = {};
    this._canvas = params.canvas || document.createElement("canvas");
    this.applied = false;

    // key is the shader program source, value is the compiled program
    this._shaderProgramCache = {};

    this._gl =
      this._canvas.getContext("webgl") ||
      this._canvas.getContext("experimental-webgl");
    if (!this._gl) {
      throw "Couldn't get WebGL context";
    }
  }

  addFilter(name) {
    const args = Array.prototype.slice.call(arguments, 1);
    const filter = this[name];

    this._filterChain.push({ func: filter, args: args });
  }

  reset() {
    this._filterChain = [];
  }

  apply(image) {
    this._resize(image.width, image.height);
    this._drawCount = 0;

    // Create the texture for the input image if we haven't yet
    if (!this._sourceTexture) this._sourceTexture = this._gl.createTexture();

    this._gl.bindTexture(this._gl.TEXTURE_2D, this._sourceTexture);
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_S,
      this._gl.CLAMP_TO_EDGE
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_T,
      this._gl.CLAMP_TO_EDGE
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MIN_FILTER,
      this._gl.NEAREST
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MAG_FILTER,
      this._gl.NEAREST
    );
    if (!this.applied) {
      this._gl.texImage2D(
        this._gl.TEXTURE_2D,
        0,
        this._gl.RGBA,
        this._gl.RGBA,
        this._gl.UNSIGNED_BYTE,
        image
      );
      this.applied = true;
    } else {
      this._gl.texSubImage2D(
        this._gl.TEXTURE_2D,
        0,
        0,
        0,
        this._gl.RGBA,
        this._gl.UNSIGNED_BYTE,
        image
      );
    }

    // No filters? Just draw
    if (this._filterChain.length == 0) {
      this._compileShader(FRAGMENT_IDENTITY);
      this._draw();
      return this._canvas;
    }

    for (let i = 0; i < this._filterChain.length; i++) {
      this._lastInChain = i == this._filterChain.length - 1;
      const f = this._filterChain[i];

      f.func.apply(this, f.args || []);
    }

    return this._canvas;
  }

  _resize(width, height) {
    // Same width/height? Nothing to do here
    if (width == this._width && height == this._height) {
      return;
    }

    this._canvas.width = this._width = width;
    this._canvas.height = this._height = height;

    // Create the context if we don't have it yet
    if (!this._vertexBuffer) {
      // Create the vertex buffer for the two triangles [x, y, u, v] * 6
      const vertices = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1,
        1, 0,
      ]);
      (this._vertexBuffer = this._gl.createBuffer()),
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, vertices, this._gl.STATIC_DRAW);

      // Note sure if this is a good idea; at least it makes texture loading
      // in Ejecta instant.
      this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    }

    this._gl.viewport(0, 0, this._width, this._height);

    // Delete old temp framebuffers
    this._tempFramebuffers = [null, null];
  }

  _getTempFramebuffer(index) {
    this._tempFramebuffers[index] =
      this._tempFramebuffers[index] ||
      this._createFramebufferTexture(this._width, this._height);

    return this._tempFramebuffers[index];
  }

  _createFramebufferTexture(width, height) {
    const fbo = this._gl.createFramebuffer();
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, fbo);

    const renderbuffer = this._gl.createRenderbuffer();
    this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderbuffer);

    const texture = this._gl.createTexture();
    this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA,
      width,
      height,
      0,
      this._gl.RGBA,
      this._gl.UNSIGNED_BYTE,
      null
    );

    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MAG_FILTER,
      this._gl.LINEAR
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MIN_FILTER,
      this._gl.LINEAR
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_S,
      this._gl.CLAMP_TO_EDGE
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_T,
      this._gl.CLAMP_TO_EDGE
    );

    this._gl.framebufferTexture2D(
      this._gl.FRAMEBUFFER,
      this._gl.COLOR_ATTACHMENT0,
      this._gl.TEXTURE_2D,
      texture,
      0
    );

    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

    return { fbo: fbo, texture: texture };
  }

  _draw(flags) {
    let source = null,
      target = null,
      flipY = false;

    // Set up the source
    if (this._drawCount == 0) {
      // First draw call - use the source texture
      source = this._sourceTexture;
    } else {
      // All following draw calls use the temp buffer last drawn to
      source = this._getTempFramebuffer(this._currentFramebufferIndex).texture;
    }
    this._drawCount++;

    // Set up the target
    if (this._lastInChain && !(flags & 1)) {
      // Last filter in our chain - draw directly to the WebGL Canvas. We may
      // also have to flip the image vertically now
      target = null;
      flipY = this._drawCount % 2 == 0;
    } else {
      // Intermediate draw call - get a temp buffer to draw to
      this._currentFramebufferIndex = (this._currentFramebufferIndex + 1) % 2;
      target = this._getTempFramebuffer(this._currentFramebufferIndex).fbo;
    }

    // Bind the source and target and draw the two triangles
    this._gl.bindTexture(this._gl.TEXTURE_2D, source);
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, target);

    this._gl.uniform1f(this._currentProgram.uniform.flipY, flipY ? -1 : 1);
    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
  }

  _compileShader(fragmentSource) {
    if (this._shaderProgramCache[fragmentSource]) {
      this._currentProgram = this._shaderProgramCache[fragmentSource];
      this._gl.useProgram(this._currentProgram.id);
      return this._currentProgram;
    }
    const VERTEX_IDENTITY = `
      attribute vec2 pos;
      attribute vec2 uv;
      varying vec2 vUv;
      void main(void) {
          gl_Position = vec4(pos, 0, 1);
          vUv = uv;
      }`;

    // Compile shaders
    this._currentProgram = new WebGLProgram(
      this._gl,
      VERTEX_IDENTITY,
      fragmentSource
    );

    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const vertSize = 4 * floatSize;
    this._gl.enableVertexAttribArray(this._currentProgram.attribute.pos);
    this._gl.vertexAttribPointer(
      this._currentProgram.attribute.pos,
      2,
      this._gl.FLOAT,
      false,
      vertSize,
      0 * floatSize
    );
    this._gl.enableVertexAttribArray(this._currentProgram.attribute.uv);
    this._gl.vertexAttribPointer(
      this._currentProgram.attribute.uv,
      2,
      this._gl.FLOAT,
      false,
      vertSize,
      2 * floatSize
    );

    this._shaderProgramCache[fragmentSource] = this._currentProgram;
    return this._currentProgram;
  }


  /**
   * Applies a color matrix transformation to the image using WebGL.
   * @param {number[]} matrix - The color matrix to apply.
   */
  colorMatrix(matrix) {
    const WITH_ALPHA_SHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform float m[20];
    
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[3] * c.a + m[4];
            gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[8] * c.a + m[9];
            gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[13] * c.a + m[14];
            gl_FragColor.a = m[15] * c.r + m[16] * c.g + m[17] * c.b + m[18] * c.a + m[19];
        }`;

    const WITHOUT_ALPHA_SHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform float m[20];
    
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[4];
            gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[9];
            gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[14];
            gl_FragColor.a = c.a;
        }`;
    // Create a Float32 Array and normalize the offset component to 0-1
    const m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    // Can we ignore the alpha value? Makes things a bit faster.
    const shader =
      1 == m[18] &&
      0 == m[3] &&
      0 == m[8] &&
      0 == m[13] &&
      0 == m[15] &&
      0 == m[16] &&
      0 == m[17] &&
      0 == m[19]
        ? WITHOUT_ALPHA_SHADER
        : WITH_ALPHA_SHADER;

    const program = this._compileShader(shader);
    this.gl.uniform1fv(program.uniform.m, m);
    this._draw();
  }

  /**
   * Adjusts the brightness of the image.
   * @param {number} brightness - The brightness value to apply. Must be a number between -1 and 1.
   */
  brightness(brightness) {
    const b = (brightness || 0) + 1;
    this.colorMatrix([
      b,
      0,
      0,
      0,
      0,
      0,
      b,
      0,
      0,
      0,
      0,
      0,
      b,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ]);
  }

  /**
   * Adjusts the saturation of an image.
   * @param {number} amount - The amount of saturation adjustment. Range from -1 to 1.
   */
  saturation(amount) {
    const x = ((amount || 0) * 2) / 3 + 1;
    const y = (x - 1) * -0.5;
    this.colorMatrix([
      x,
      y,
      y,
      0,
      0,
      y,
      x,
      y,
      0,
      0,
      y,
      y,
      x,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ]);
  }

  /**
   * Adjusts the contrast of the image.
   * @param {number} amount - The amount of contrast adjustment. A value of 0 means no change, negative values decrease contrast, and positive values increase contrast.
   */
  contrast(amount) {
    const v = (amount || 0) + 1;
    const o = -128 * (v - 1);

    this.colorMatrix([
      v,
      0,
      0,
      0,
      o,
      0,
      v,
      0,
      0,
      o,
      0,
      0,
      v,
      0,
      o,
      0,
      0,
      0,
      1,
      0,
    ]);
  }

  /**
   * Applies the negative filter to the image.
   */
  negative() {
    this.contrast(-2);
  }

  /**
   * Inverts the colors of the image using WebGL.
   */
  invert() {
    const INVERT_SHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            gl_FragColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
        }`;
    this._compileShader(INVERT_SHADER);
    this._draw();
  }

  /**
   * Applies a convolution filter to the image using the provided matrix.
   * @param {number[]} matrix - The convolution matrix.
   */
  _convolution(matrix) {
    const CONVOLUTION_SHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform vec2 px;
        uniform float m[9];
    
        void main(void) {
            vec4 c11 = texture2D(texture, vUv - px); // top left
            vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y)); // top center
            vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y)); // top right
    
            vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) ); // mid left
            vec4 c22 = texture2D(texture, vUv); // mid center
            vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) ); // mid right
    
            vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) ); // bottom left
            vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) ); // bottom center
            vec4 c33 = texture2D(texture, vUv + px ); // bottom right
    
            gl_FragColor = 
                c11 * m[0] + c12 * m[1] + c22 * m[2] +
                c21 * m[3] + c22 * m[4] + c23 * m[5] +
                c31 * m[6] + c32 * m[7] + c33 * m[8];
            gl_FragColor.a = c22.a;
        }`;
    const m = new Float32Array(matrix);
    const pixelSizeX = 1 / this._width;
    const pixelSizeY = 1 / this._height;

    const program = this._compileShader(CONVOLUTION_SHADER);
    this.gl.uniform1fv(program.uniform.m, m);
    this.gl.uniform2f(program.uniform.px, pixelSizeX, pixelSizeY);
    this._draw();
  }

  /**
   * Applies edge detection filter to the image.
   */
  detectEdges() {
    this._convolution([0, 1, 0, 1, -4, 1, 0, 1, 0]);
  }

  /**
   * Applies a sharpen filter to the image.
   */
  sharpen() {
    const a = SHARPEN_FILTER_AMOUNT;
    this._convolution([0, -1 * a, 0, -1 * a, 1 + 4 * a, -1 * a, 0, -1 * a, 0]);
  }

  /**
   * Applies the emboss filter to the image.
   */
  emboss() {
    const s = EMBOSS_FILTER_AMOUNT;
    this._convolution([-2 * s, -1 * s, 0, -1 * s, 1, 1 * s, 0, 1 * s, 2 * s]);
  }

  /**
   * Applies an OS filter to the image using WebGL.
   */
  osFilter() {
    const OS_FILTER_SHADER = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D texture;
            uniform vec2 hue_range;
            uniform float lightness_for_deleted;
            void main(void) {
                vec4 c = texture2D(texture, vUv);
                float lightness = (c.r + c.g + c.b) / 3.0;
                float hue = 0.0;
                if (c.r >= c.g && c.r >= c.b) {
                    hue = (c.g - c.b) / (c.r - min(c.g, c.b));
                } else if (c.g >= c.r && c.g >= c.b) {
                    hue = 2.0 + (c.b - c.r) / (c.g - min(c.r, c.b));
                } else {
                    hue = 4.0 + (c.r - c.g) / (c.b - min(c.r, c.g));
                }
                if (hue >= hue_range[0] && hue <= hue_range[1]) {
                    gl_FragColor = vec4(lightness_for_deleted, lightness_for_deleted, lightness_for_deleted, c.a);
                } else {
                    gl_FragColor = c;
                }
            }
        `;
    const program = this._compileShader(OS_FILTER_SHADER);
    const _hue_range = OS_FILTER_RANGE;
    const _lightness_for_deleted = OS_FILTER_LIGHTNESS;
    this._gl.uniform2f(program.uniform.hue_range, _hue_range[0], _hue_range[1]);
    this._gl.uniform1f(
      program.uniform.lightness_for_deleted,
      _lightness_for_deleted
    );
    this._draw();
  }

  /**
   * Applies an O2 filter to the image using WebGL.
   */
  O2Filter() {
    const O2_FILTER_SHADER = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D texture;
            uniform vec2 hue_range;
            uniform float lightness_for_deleted;
            void main(void) {
                vec4 c = texture2D(texture, vUv);
                float lightness = (c.r + c.g + c.b) / 3.0;
                float hue = 0.0;
                if (c.r >= c.g && c.r >= c.b) {
                    hue = (c.g - c.b) / (c.r - min(c.g, c.b));
                } else if (c.g >= c.r && c.g >= c.b) {
                    hue = 2.0 + (c.b - c.r) / (c.g - min(c.r, c.b));
                } else {
                    hue = 4.0 + (c.r - c.g) / (c.b - min(c.r, c.g));
                }
                if (hue >= hue_range[0] && hue <= hue_range[1]) {
                    gl_FragColor = vec4(lightness_for_deleted, lightness_for_deleted, lightness_for_deleted, c.a);
                } else {
                    gl_FragColor = c;
                }
            }`;
    const program = this._compileShader(O2_FILTER_SHADER);
    const _hue_range = O2_FILTER_RANGE;
    const _lightness_for_deleted = O2_FILTER_LIGHTNESS;
    this._gl.uniform2f(program.uniform.hue_range, _hue_range[0], _hue_range[1]);
    this._gl.uniform1f(
      program.uniform.lightness_for_deleted,
      _lightness_for_deleted
    );
    this._draw();
  }

  /**
   * Applies a grayscale filter to the image using WebGL.
   */
  senFilter() {
    const SEN_FILTER_SHADER = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D texture;
            void main(void) {
                vec4 c = texture2D(texture, vUv);
                float lightness = (c.r + c.g + c.b) / 3.0;
                gl_FragColor = vec4(lightness, lightness, lightness, c.a);
            }`;
    this._compileShader(SEN_FILTER_SHADER);
    this._draw();
  }

  /**
   * Converts the image to black and white.
   */
  blackWhite() {
    const BLACK_AND_WHITE_SHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            float lightness = (c.r + c.g + c.b) / 3.0;
            gl_FragColor = vec4(lightness, lightness, lightness, c.a);
        }`;
    this._compileShader(BLACK_AND_WHITE_SHADER);
    this._draw();
  }

  /**
   * Applies a strip organic filter to the image using WebGL.
   */
  stripOrganic() {
    const stripSHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform vec2 hue_range;
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            float lightness = (c.r + c.g + c.b) / 3.0;
            float hue = 0.0;
            if (c.r >= c.g && c.r >= c.b) {
                hue = (c.g - c.b) / (c.r - min(c.g, c.b));
            } else if (c.g >= c.r && c.g >= c.b) {
                hue = 2.0 + (c.b - c.r) / (c.g - min(c.r, c.b));
            } else {
                hue = 4.0 + (c.r - c.g) / (c.b - min(c.r, c.g));
            }
            if (hue >= hue_range[0] && hue <= hue_range[1]) {
                gl_FragColor = vec4(lightness, lightness, lightness, 0.4);
            } else {
                gl_FragColor = c;
            }
        }`;
    const program = this._compileShader(stripSHADER);
    this._gl.uniform2f(program.uniform.hue_range, 0, 2);
    this._draw();
  }

  /**
   * Applies an organic filter to the image using WebGL.
   */
  organicOnly() {
    const stripSHADER = `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform vec2 hue_range;
        void main(void) {
            vec4 c = texture2D(texture, vUv);
            float lightness = (c.r + c.g + c.b) / 3.0;
            float hue = 0.0;
            if (c.r >= c.g && c.r >= c.b) {
                hue = (c.g - c.b) / (c.r - min(c.g, c.b));
            } else if (c.g >= c.r && c.g >= c.b) {
                hue = 2.0 + (c.b - c.r) / (c.g - min(c.r, c.b));
            } else {
                hue = 4.0 + (c.r - c.g) / (c.b - min(c.r, c.g));
            }
            if (hue >= hue_range[0] && hue <= hue_range[1]) {
                gl_FragColor = vec4(lightness, lightness, lightness, 0.4);
            } else {
                gl_FragColor = c;
            }
        }`;
    const program = this._compileShader(stripSHADER);
    this._gl.uniform2f(program.uniform.hue_range, 1.5, 255);
    this._draw();
  }
}
