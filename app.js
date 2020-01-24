// Need a vertex shader - this has attributes as input parameters and
// varyings as outputs. It is written in GL shader language - we use
// strings to write this in this file rather than in a separate file
// as js is a 'bit picky'
// For every vertex shader there is a special value called gl_Position,
// which determines where the vertex should be drawn on the render surface
var vertexShaderText = 
[
// This first line is necessary, don't pay it too much attention right now
'precision mediump float;',
'',
// vec2 will have an x and y component
'attribute vec2 vertPosition;',
'',
'void main()',
'{',
// gl_Position is a 4-dimensional vector
// We set x and y to the values in vertPosition
// We set z to 0.0
// We always set the last parameter to 1.0 (don't need to worry about this
// right now)
'   gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

// Need a fragment shader - this will decide what to display for each
// pixel based on the result of the vertex shader
var fragmentShaderText = 
[
'precision mediump float;',
'',
'void main()',
'{',
// Values are Red, Green, Blue, Alpha
'    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
'}'
].join('\n');

var InitDemo = function () {
    console.log('This is working.');

    // Initialising WebGL
    var canvas = document.getElementById('game-surface');
    // The variable canvas now represents the entire canvas element
    // called game-surface from the HTML
    var gl = canvas.getContext('webgl');
    // The above is all that is necessary to get the WebGL context in
    // Chrome and Firefox - more needs to be done for some other browsers
    if (!gl) {
        // Logging that we are having to use experimental
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    // If no WebGl support, tell the user so:
    if (!gl) {
        alert('Your browser does not support WebGL');
    }
    // We now have our context; we have initialised WebGL (if possible)

    // Starting by clearing to a flat background colour
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    // Nothing will have happened yet, just 'set paint colour'
    // Now need to tell it what to clear in order to 'apply the paint'
    // N.B. colour buffer stores what colours all the pixels should be;
    // depth buffer stores how 'deep into the screen' a pixel is (good for
    // e.g. drawing something in front of something else)
    // For good practice, we will clear both of these buffers, eventhough
    // just clearing the colour buffer would work
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Getting ready to use vertex shader and fragment shader
    // Creating shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGEMENT_SHADER);
    // Now need to compile shaders from code written in text earlier
    // Seeting shader sources (the code)
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    // Now need to compile
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
}