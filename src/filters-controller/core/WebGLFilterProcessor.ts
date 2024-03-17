import { FilterId } from "../useFilters";
import {
  BLACK_AND_WHITE_SHADER,
  CONVOLUTION_SHADER,
  FRAGMENT_IDENTITY_SHADER,
  INVERT_SHADER,
  STRIP_HUE_RANGE_SHADER,
  VERTEX_IDENTITY_SHADER,
  COLOR_MATRIX_WITHOUT_ALPHA_SHADER,
  COLOR_MATRIX_WITH_ALPHA_SHADER,
  VARI_SHADER,
} from "./shaders";

const OS_FILTER_RANGE = [0, 2];
const OS_FILTER_LIGHTNESS = 1;
const O2_FILTER_RANGE = [2, 256];
const O2_FILTER_LIGHTNESS = 1;
const EMBOSS_FILTER_AMOUNT = 4;
const SHARPEN_FILTER_AMOUNT = 10;

interface Filter {
  type: FilterId;
  func?: WebGLFilterProcessor[FilterId];
  args?: unknown[];
}

interface FrameBuffer {
  fbo: WebGLFramebuffer | null;
  texture: WebGLTexture | null;
}
/**
 * Represents a WebGLImageFilter used for applying image filters using WebGL.
 */
export class WebGLFilterProcessor {
  private _gl: WebGLRenderingContext;
  private _drawCount = 0;
  private _sourceTexture: WebGLTexture | null = null;
  private _lastInChain = false;
  private _currentFramebufferIndex = -1;
  private _tempFramebuffers: FrameBuffer[] | null[] = [];
  private _filterChain: Filter[] = [];
  private _width = -1;
  private _height = -1;
  private _vertexBuffer: WebGLBuffer | null = null;
  private _currentProgram: WebGLProgram | null = null;
  private _applied = false;
  private _shaderProgramCache: Record<string, WebGLProgram> = {};
  private _canvas: HTMLCanvasElement;

  public constructor() {
    this._canvas = document.createElement("canvas");
    this._gl =
      this._canvas.getContext("webgl") ||
      (this._canvas.getContext("experimental-webgl") as WebGLRenderingContext);
    if (!this._gl) {
      throw "Couldn't get WebGL context";
    }
  }

  public addFilter(name: FilterId, ...args: unknown[]) {
    // get the method from the name
    const filter = this[name];
    this._filterChain.push({ func: filter, args: args });
  }

  public reset() {
    this._filterChain = [];
  }

  public apply(image: HTMLImageElement) {
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
    if (!this._applied) {
      this._gl.texImage2D(
        this._gl.TEXTURE_2D,
        0,
        this._gl.RGBA,
        this._gl.RGBA,
        this._gl.UNSIGNED_BYTE,
        image
      );
      this._applied = true;
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
      this._compileShader(FRAGMENT_IDENTITY_SHADER);
      this._draw();
      return this._canvas;
    }

    this._filterChain.forEach((f, i) => {
      this._lastInChain = i === this._filterChain.length - 1;
      // @ts-expect-error - TS doesn't know that f.func is a function
      f.func.apply(this, f.args);
    });

    return this._canvas;
  }

  private _resize(width: number, height: number) {
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
      this._gl.bufferData(
        this._gl.ARRAY_BUFFER,
        vertices,
        this._gl.STATIC_DRAW
      );

      // Note sure if this is a good idea; at least it makes texture loading
      // in Ejecta instant.
      this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    }

    this._gl.viewport(0, 0, this._width, this._height);

    // Delete old temp framebuffers
    this._tempFramebuffers = [null, null];
  }

  private _getTempFramebuffer(index: number) {
    this._tempFramebuffers[index] =
      this._tempFramebuffers[index] ||
      this._createFramebufferTexture(this._width, this._height);

    return this._tempFramebuffers[index];
  }

  private _createFramebufferTexture(width: number, height: number) {
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

  /**
   * Draws the image filter using WebGL.
   */
  private _draw(flags = 0) {
    if (!this._currentProgram) return;
    let source = null,
      target = null,
      flipY = false;

    // Set up the source
    if (this._drawCount == 0) {
      // First draw call - use the source texture
      source = this._sourceTexture;
    } else {
      // All following draw calls use the temp buffer last drawn to
      source = this._getTempFramebuffer(this._currentFramebufferIndex)?.texture;
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
      target = this._getTempFramebuffer(this._currentFramebufferIndex)?.fbo;
    }

    // Bind the source and target and draw the two triangles
    this._gl.bindTexture(this._gl.TEXTURE_2D, source as WebGLTexture);
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, target as WebGLFramebuffer);

    this._gl.uniform1f(this._currentProgram.uniform.flipY, flipY ? -1 : 1);
    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
  }

  private _compileShader(fragmentSource: string) {
    if (this._shaderProgramCache[fragmentSource]) {
      this._currentProgram = this._shaderProgramCache[fragmentSource];
      this._gl.useProgram(this._currentProgram.id);
      return this._currentProgram;
    }

    // Compile shaders
    this._currentProgram = new WebGLProgram(
      this._gl,
      VERTEX_IDENTITY_SHADER,
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
   */
  public colorMatrix(matrix: number[]) {
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
        ? COLOR_MATRIX_WITHOUT_ALPHA_SHADER
        : COLOR_MATRIX_WITH_ALPHA_SHADER;

    const program = this._compileShader(shader);
    this._gl.uniform1fv(program.uniform.m, m);
    this._draw();
  }

  /**
   * Applies a convolution filter to the image using the provided matrix.
   */
  public convolution(matrix: number[]) {
    const m = new Float32Array(matrix);
    const pixelSizeX = 1 / this._width;
    const pixelSizeY = 1 / this._height;

    const program = this._compileShader(CONVOLUTION_SHADER);
    this._gl.uniform1fv(program.uniform.m, m);
    this._gl.uniform2f(program.uniform.px, pixelSizeX, pixelSizeY);
    this._draw();
  }

  /**
   * Adjusts the contrast of the image.
   * @param {number} amount - The amount of contrast adjustment. A value of 0 means no change, negative values decrease contrast, and positive values increase contrast.
   */
  public contrast(amount: number) {
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
   * Applies edge detection filter to the image.
   */
  public detectEdges() {
    this.convolution([0, 1, 0, 1, -4, 1, 0, 1, 0]);
  }

  /**
   * Inverts the colors of the image using WebGL.
   */
  public invert() {
    this._compileShader(INVERT_SHADER);
    this._draw();
  }

  /**
   * Applies a sharpen filter to the image.
   */
  public sharpen() {
    const a = SHARPEN_FILTER_AMOUNT;
    this.convolution([0, -1 * a, 0, -1 * a, 1 + 4 * a, -1 * a, 0, -1 * a, 0]);
  }

  /**
   * Applies the emboss filter to the image.
   */
  public emboss() {
    const s = EMBOSS_FILTER_AMOUNT;
    this.convolution([-2 * s, -1 * s, 0, -1 * s, 1, 1 * s, 0, 1 * s, 2 * s]);
  }

  /**
   * Applies an OS filter to the image using WebGL.
   */
  public osFilter() {
    const program = this._compileShader(STRIP_HUE_RANGE_SHADER);
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
   * Converts the image to black and white.
   */
  public blackWhite() {
    this._compileShader(BLACK_AND_WHITE_SHADER);
    this._draw();
  }

  public variance(args: number) {
    const index = args || 4;
    const bars = [
      [64, 0],
      [24, 88],
      [48, 112],
      [72, 136],
      [96, 160],
      [120, 184],
      [144, 208],
      [168, 232],
      [192, 256],
    ];
    const from = bars[index][0] / 256;
    const to = bars[index][1] / 256;

    console.log(
      "applying variance filter with: ",
      from,
      to
    );

    const program = this._compileShader(VARI_SHADER);
    this._gl.uniform2f(
      program.uniform.lightness_range,
      from,
      to
    );
    this._draw();
  }

  /**
   * Applies an O2 filter to the image using WebGL.
   */
  public O2Filter() {
    const program = this._compileShader(STRIP_HUE_RANGE_SHADER);
    const _hue_range = O2_FILTER_RANGE;
    const _lightness_for_deleted = O2_FILTER_LIGHTNESS;
    this._gl.uniform2f(program.uniform.hue_range, _hue_range[0], _hue_range[1]);
    this._gl.uniform1f(
      program.uniform.lightness_for_deleted,
      _lightness_for_deleted
    );
    this._draw();
  }

  public applyFilters(filters: Filter[], image: HTMLImageElement) {
    filters.forEach((f) => {
      this.addFilter(f.type, f.args);
    });

    return this.apply(image);
  }
}

/**
 * Represents a WebGL program used for image filtering.
 */
class WebGLProgram {
  public uniform: Record<string, WebGLUniformLocation> = {};
  public attribute: Record<string, number> = {};
  public id: WebGLProgram;

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    const _collect = (
      source: string,
      prefix: string,
      collection: Record<string, WebGLUniformLocation>
    ) => {
      const r = new RegExp("\\b" + prefix + " \\w+ (\\w+)", "ig");
      source.replace(r, (match, name) => {
        collection[name] = 0;
        return match;
      });
    };

    const _compile = (
      gl: WebGLRenderingContext,
      source: string,
      type: number
    ) => {
      const shader = gl.createShader(type) as WebGLShader;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const _vsh = _compile(gl, vertexSource, gl.VERTEX_SHADER) as WebGLShader;
    const _fsh = _compile(
      gl,
      fragmentSource,
      gl.FRAGMENT_SHADER
    ) as WebGLShader;

    this.id = gl.createProgram() as WebGLProgram;
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
      this.uniform[u] = gl.getUniformLocation(
        this.id,
        u
      ) as WebGLUniformLocation;
    }
  }
}
