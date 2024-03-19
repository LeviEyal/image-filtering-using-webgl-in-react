const RGB_TO_HSL_SHADER = `
vec3 rgb2hls(vec3 rgb) {
    float maxVal = max(rgb.r, max(rgb.g, rgb.b));
    float minVal = min(rgb.r, min(rgb.g, rgb.b));
    float l = (maxVal + minVal) / 2.0;
    float s, h;

    if (maxVal == minVal) {
        h = 0.0;
        s = 0.0;
    } else {
        float d = maxVal - minVal;
        s = l > 0.5 ? d / (2.0 - maxVal - minVal) : d / (maxVal + minVal);

        if (maxVal == rgb.r) {
            h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6.0 : 0.0);
        } else if (maxVal == rgb.g) {
            h = (rgb.b - rgb.r) / d + 2.0;
        } else {
            h = (rgb.r - rgb.g) / d + 4.0;
        }

        h /= 6.0;
    }

    return vec3(h, l, s);
}`;

const HUE_TO_RGB_SHADER = `
float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
}`;

const HSL_TO_RGB_SHADER = `
vec3 hls2rgb(vec3 hls) {
    float h = hls.x;
    float l = hls.y;
    float s = hls.z;
    float r, g, b;

    if (s == 0.0) {
        r = g = b = l;
    } else {
        float q = l < 0.5 ? l * (1.0 + s) : l + s - (l * s);
        float p = 2.0 * l - q;
        r = hue2rgb(p, q, h + 1.0 / 3.0);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1.0 / 3.0);
    }

    return vec3(r, g, b);
}
`;

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

${RGB_TO_HSL_SHADER}
${HUE_TO_RGB_SHADER}
${HSL_TO_RGB_SHADER}

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
        // gl_FragColor = vec4(c.r, c.g, c.b, c.a * 0.5);
    } else {
        gl_FragColor = c;
    }
}`;


export const VAR_ABSORPTION_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture; // Texture containing the image
uniform vec2 lightness_range;

${RGB_TO_HSL_SHADER}
${HUE_TO_RGB_SHADER}
${HSL_TO_RGB_SHADER}

void main(void) {
    vec4 color = texture2D(texture, vUv);
    float u_a = lightness_range[0]; // Minimum lightness value
    float u_b = lightness_range[1]; // Maximum lightness value
    
    // Convert the color from RGB to HSL
    vec3 hls = rgb2hls(color.rgb);
    float hue = hls.x;
    float lightness = hls.y;
    float saturation = hls.z;
    
    if (lightness < u_a) {
        // Set lightness to 0
        lightness = 0.0;
    } else if (lightness > u_b) {
        // Set lightness to 1
        lightness = 1.0;
    } else {
        // Adjust lightness proportionally between a and b
        lightness = (lightness - u_a) / (u_b - u_a);
    }
    
    // Convert HLS back to RGB
    vec3 rgb = hls2rgb(vec3(hue, lightness, saturation));

    gl_FragColor = vec4(rgb, color.a);
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

export const HIGH_PENETRATION_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture; // Texture containing the image
uniform float gamma_high;

${RGB_TO_HSL_SHADER}
${HUE_TO_RGB_SHADER}
${HSL_TO_RGB_SHADER}

void main(void) {
    vec4 color = texture2D(texture, vUv);
    
    // Convert the color from RGB to HSL
    vec3 hls = rgb2hls(color.rgb);
    float hue = hls.x;
    float lightness = hls.y;
    float saturation = hls.z;
    float new_lightness = pow(lightness, gamma_high);
    
    // Convert HLS back to RGB
    vec3 rgb = hls2rgb(vec3(hue, new_lightness, saturation));

    gl_FragColor = vec4(rgb, color.a);
}
`;

const APPLY_CLAHE_SHADER = `
    float applyCLAHE(sampler2D inputTexture, vec2 resolution, float clipLimit, float kernelSize) {
        // Get the texture coordinate
        vec2 texCoord = gl_FragCoord.xy / resolution;

        // Calculate the size of the tile
        vec2 tileSize = vec2(1.0 / kernelSize);

        // Calculate the position of the current tile
        vec2 tileCoord = floor(texCoord / tileSize);

        // Calculate the area of the current tile
        vec4 sum = vec4(0.0);
        for (float x = -1.0; x <= 1.0; x += 1.0) {
            for (float y = -1.0; y <= 1.0; y += 1.0) {
                vec2 offset = tileSize * vec2(x, y);
                vec4 color = texture2D(inputTexture, tileCoord * tileSize + offset);
                sum += color;
            }
        }

        // Calculate the average color of the tile
        vec4 averageColor = sum / 9.0;

        // Calculate the clip limit
        clipLimit = clipLimit * dot(averageColor.rgb, vec3(1.0 / 3.0));

        // Apply CLAHE to the current tile
        vec4 tileColor = texture2D(inputTexture, texCoord);
        vec4 clippedColor = max(tileColor - averageColor + clipLimit, 0.0);
        vec4 equalizedColor = min(clippedColor * (1.0 / (1.0 + clipLimit)), 1.0);

        // Output the equalized color
        return equalizedColor.x;
    }
`;

export const SEN_FILTER_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D texture;
uniform vec2 resolution;
uniform float sen_clip_limit;
uniform float sen_kernel_size;

${APPLY_CLAHE_SHADER}
${RGB_TO_HSL_SHADER}
${HUE_TO_RGB_SHADER}
${HSL_TO_RGB_SHADER}

void main() {
    vec3 hls = rgb2hls(texture2D(texture, vUv).rgb);
    float equalizedColor = applyCLAHE(texture, resolution, sen_clip_limit, sen_kernel_size);

    vec4 color = vec4(hls2rgb(vec3(hls.x, equalizedColor, hls.z)), 1.0);
    gl_FragColor = color;
}
`;

