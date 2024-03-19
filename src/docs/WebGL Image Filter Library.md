# WebGL Image Filter Library

This library provides a set of classes for applying image filters using WebGL in the browser. It consists of two main classes: `WebGLProgram` and `WebGLImageFilter`.

## WebGLProgram

The `WebGLProgram` class represents a WebGL program used for image filtering. It is responsible for compiling and linking the vertex and fragment shaders. Here's a breakdown of its methods:

- **constructor(gl, vertexSource, fragmentSource)**: Constructs a new `WebGLProgram` instance with the provided WebGL context (`gl`), vertex shader source (`vertexSource`), and fragment shader source (`fragmentSource`). It compiles the shaders, links them into a program, and collects the uniform and attribute locations.

## WebGLImageFilter

The `WebGLImageFilter` class provides a set of methods for applying various image filters to a given image using WebGL. Here's a breakdown of its methods:

- **constructor()**: Creates a new `WebGLImageFilter` instance and initializes the WebGL context.
- **addFilter(name, ...args)**: Adds a filter to the filter chain. The `name` parameter is the name of the filter method to be called, and `args` are any additional arguments required by the filter.
- **reset()**: Resets the filter chain.
- **apply(image)**: Applies the filter chain to the given `image` and returns the resulting canvas element.
- **_resize(width, height)**: Resizes the internal canvas to the specified `width` and `height`.
- **_getTempFramebuffer(index)**: Retrieves a temporary framebuffer for rendering intermediate results.
- **_createFramebufferTexture(width, height)**: Creates a new framebuffer texture with the specified `width` and `height`.
- **_draw(flags)**: Draws the image filter using WebGL.
- **_compileShader(fragmentSource)**: Compiles a new shader program with the given `fragmentSource`.
- **colorMatrix(matrix)**: Applies a color matrix transformation to the image using WebGL.
- **convolution(matrix)**: Applies a convolution filter to the image using the provided matrix.
- **contrast(amount)**: Adjusts the contrast of the image.
- **detectEdges()**: Applies an edge detection filter to the image.
- **negative()**: Applies the negative filter to the image.
- **invert()**: Inverts the colors of the image using WebGL.
- **sharpen()**: Applies a sharpen filter to the image.
- **highPenetrationFilter()**: Applies the highPenetrationFilter filter to the image.
- **osFilter()**: Applies an OS filter to the image using WebGL.
- **o2Filter()**: Applies an O2 filter to the image using WebGL.
- **blackWhite()**: Converts the image to black and white.

The library also includes several constants for configuring the behavior of some filters, such as `OS_FILTER_RANGE`, `OS_FILTER_LIGHTNESS`, `O2_FILTER_RANGE`, `O2_FILTER_LIGHTNESS`, `highPenetrationFilter_FILTER_AMOUNT`, and `SHARPEN_FILTER_AMOUNT`.

To use the library, you need to create an instance of `WebGLImageFilter`, add the desired filters to the filter chain using `addFilter`, and then call the `apply` method with the input image. The resulting canvas element can be used for further processing or rendering.

Note that this library assumes the availability of WebGL support in the browser, and it may not work on older or less capable browsers.