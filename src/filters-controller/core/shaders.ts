export const BLACK_AND_WHITE_SHADER = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D texture;
    void main(void) {
        vec4 c = texture2D(texture, vUv);
        float lightness = (c.r + c.g + c.b) / 3.0;
        gl_FragColor = vec4(lightness, lightness, lightness, c.a);
    }
`;

export const STRIP_HUE_RANGE_SHADER = `
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

export const INVERT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture;
void main(void) {
    vec4 c = texture2D(texture, vUv);
    gl_FragColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
}`;

export const CONVOLUTION_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture;
uniform vec2 px;
uniform float m[9];

void main(void) {
  vec4 c11 = texture2D(texture, vUv - px);                          // top left
  vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y));         // top center
  vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y));  // top right
  
  vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) );        // mid left
  vec4 c22 = texture2D(texture, vUv);                               // mid center
  vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) );        // mid right
  
  vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) ); // bottom left
  vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) );        // bottom center
  vec4 c33 = texture2D(texture, vUv + px ); // bottom right
  
  gl_FragColor = 
    c11 * m[0] + c12 * m[1] + c22 * m[2] +
    c21 * m[3] + c22 * m[4] + c23 * m[5] +
    c31 * m[6] + c32 * m[7] + c33 * m[8];
  gl_FragColor.a = c22.a;
}`;

export const COLOR_MATRIX_WITHOUT_ALPHA_SHADER = `
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

export const COLOR_MATRIX_WITH_ALPHA_SHADER = `
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

export const VERTEX_IDENTITY_SHADER = `
precision highp float;
attribute vec2 pos;
attribute vec2 uv;
varying vec2 vUv;
uniform float flipY;

void main(void) {
  vUv = uv;
  gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);
}`;

export const FRAGMENT_IDENTITY_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture;

void main(void) {
  gl_FragColor = texture2D(texture, vUv);
}`;
