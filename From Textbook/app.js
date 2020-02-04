// Carrying out examples from the textbook

// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

function main() {
    // Retrieve canvas element
    var canvas = document.getElementById('game-surface');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Load the shaders from files
    loadShaderFile(gl, 'shader.vs.glsl', gl.VERTEX_SHADER);
    loadShaderFile(gl, 'shader.fs.glsl', gl.FRAGMENT_SHADER);
}

function start(gl) {
    // Initialise shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialise shaders.');
        return;
    }

    // Specify the colour for clearing the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clearing the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
}

function loadShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onLoadShader(gl, request.responseText, shader);
        }
    }
    request.open('GET', fileName, true);
    request.send(); // Send the request
}

function onLoadShader(gl, fileString, type) {
    if (type == gl.VERTEX_SHADER) { // The vertex shader is loaded
        VSHADER_SOURCE = fileString;
    } else
    if (type == gl.FRAGMENT_SHADER) { // The fragment shader is loaded
        FSHADER_SOURCE = fileString;
    }
    // Start rendering, after loading both shaders
    if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
} 