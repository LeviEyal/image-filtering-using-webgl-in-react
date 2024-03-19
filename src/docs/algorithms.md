# Image Processing Algorithms

## Table of Contents
1. [Introduction](#introduction)
2. [Image Processing](#image-processing)
3. [Image Processing Algorithms](#image-processing-algorithms)
    1. [Internal image processing algorithms](#internal-image-processing-algorithms)
    2. [Black and White](#black-and-white)
    3. [Contrast](#contrast)
    4. [Invert](#invert)
    5. [Only Organics](#only-organics)
    6. [Strip Organics](#strip-organics)
    7. [High Penetration](#high-penetration)

## Introduction
This document describes the image processing algorithms used in the project.

## Image Processing
The image processing is done using the webgl shaders. The shaders are written in GLSL (OpenGL Shading Language) and are executed on the GPU. The shaders are used to process the image data and produce the final image.

## Image Processing Algorithms
The following are the image processing algorithms used in the project.

### Internal image processing algorithms
The following are the internal image processing algorithms used in the project.
#### Color Matrix Algorithm
This algorithm applies a color matrix to the image.
The algorithm:
1. Multiplies the red, green, and blue channels by the red, green, and blue values in the color matrix.
2. Adds the red, green, and blue values in the color matrix to the red, green, and blue channels.
Links: 
- [Color Matrix](https://en.wikipedia.org/wiki/Color_matrix)
- [Color Matrix Shader](https://www.shadertoy.com/view/4dX3z4)
- [Manipulate Visual Effects With the ColorMatrixFilter and ConvolutionFilter](https://code.tutsplus.com/manipulate-visual-effects-with-the-colormatrixfilter-and-convolutionfilter--active-3221t)


#### Convolution Algorithm
This algorithm applies a convolution matrix to the image.
The algorithm:
1. Takes a nxn matrix (convolution matrix) and a kernel size.
2. Performs a convolution operation on the image using the convolution matrix and the kernel size.
Links:
- [Convolution](https://en.wikipedia.org/wiki/Convolution)

### Black and White
This algorithm converts the image to black and white.
The algorithm:
1. Calculates the average of the red, green, and blue channels.
2. Sets the red, green, and blue channels to the average value.

### Contrast
This algorithm increases the contrast of the image.
The algorithm given an amount:
1. Calculates the contrast value using the formula: `v = (259 * (amount + 1))`
2. Calculates the offset value using the formula: `o = -128 * (1 - v)`

Using color matrix:
```
[v, 0, 0, 0, o]
[0, v, 0, 0, o]
[0, 0, v, 0, o]
[0, 0, 0, 1, 0]
```
Where `v` is the contrast value and `o` is the offset value.

### Invert
This algorithm inverts the colors of the image.
The algorithm:
1. Sets the red, green, and blue channels to `1 - value`.

### Only Organics
This algorithm removes all non-organic materials from the image.
The algorithm:
1. Converts the image from RGB to HSL.
2. Sets the saturation and lightness to 0 for all non-organic materials (based on the color of the non-organic materials in the HSL color space. In our case, the non-organic materials are in the range of 0.0 to 2 in the HSL color space).
3. Converts the image from HSL to RGB.

### Strip Organics
This algorithm removes all organic materials from the image.
The algorithm:
Same as the "Only Organics" algorithm, but it removes all organic materials instead of non-organic materials, and keeps the non-organic materials.


### High Penetration
This algorithm increases the penetration of the image.
The algorithm:
TODO: Add algorithm details.

## Tasks
- Investigate how to implement the filters on the browser.
- Implement the filters using webgl shaders.
- Test the filters on different images.
- Optimize the filters for performance.
- Ensure compatibility on Firefox browser.
- Implement the UI components.
- Create the FiltersManagementContext to manage the filters with reducers.
- Log each operation of the filters.
- Validate the filters configuration sent by the frontend.

backend tasks:
- Design DB models for the filters configuration per station
- Implement DB models for the filters configuration per station
- Implement the API endpoints for the filters configuration per station
- Integrate the filters configuration per station with the frontend