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
// Adding an attribute for colour
'attribute vec3 vertColour;',
// Adding output for colour
'varying vec3 fragColour;',
'',
'void main()',
'{',
// Not doing anything exciting with colour, just put output=input
'fragColour = vertColour;',
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
// Adding colour input
'varying vec3 fragColour;',
'void main()',
'{',
// Values are Red, Green, Blue, Alpha
// Note that RGB is taken from fragColour
'    gl_FragColor = vec4(fragColour, 1.0);',
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
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    // Now need to compile shaders from code written in text earlier
    // Seeting shader sources (the code)
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    // Now need to compile
    gl.compileShader(vertexShader);
    // Checking for compilation errors
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        // Message includes extra info
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        // Return so that function doesn't continue trying to run with
        // an invalid shader
        return;
    }
    gl.compileShader(fragmentShader);
    // Checking for compilation errors
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        // Message includes extra info
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        // Return so that function doesn't continue trying to run with
        // an invalid shader
        return;
    }
    // Now we have a vertex shader and a fragment shader that are ready to use

    // Now have to tell WebGL that the two shaders we have are the ones we want
    // to use in the overall 'program'
    var program = gl.createProgram();
    // Notice that when attaching shaders to program we don't need to specify
    // their type, as they already 'know'
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Now that we have attached both our shaders, we need to link the program
    // together (remember, compile then link)
    gl.linkProgram(program);
    // Now check for linker errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    // Next step is 'validating' the program, which catches additional errors
    // N.B. Only use this in testing, as it is more expensive - in actual game
    // production this is only used in the debugging release
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR: validating program!', gl.getProgramInfoLog(program));
        return;
    }

    // We have now set up the graphics card program and it is ready to
    // accept our vertices
    // We now need to set all of the information which the graphics card
    // is going to be using
    // Need to create a list of x and y positions that will define
    // our triangle
    // Once we have done that, we need to attach that list to the
    // graphics card - to the vertex shader
    // N.B. we define the vetices of a triangle in counter-clockwise
    // order
    var triangleVertices = 
    [ // X, Y        R, G, B
        0.0, 0.5,    1.0, 1.0, 0.0,
        -0.5, -0.5,  0.7, 0.0, 1.0,
        0.5, -0.5,   0.1, 1.0, 0.6,
        1.0, 0.5,    0.5, 0.0, 0.5,
        0.5, -0.5,   0.1, 1.0, 0.6,
        0.0, 0.5,    1.0, 1.0, 0.0
    ];
    // At this stage, triangleVertices is in the RAM, the graphics
    // card (so, also the vertex shader) has no knowledge of it yet
    // N.B. graphics card programming uses buffers to store chunks
    // of information - a buffer is a chunk of info on the GPU
    var triangleVertexBufferObject = gl.createBuffer();
    // Need to bind buffer
    // We are setting the vertex we have just created to be the
    // active buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // Setting the data to be used - note that in js we need to use
    // new Float32Array because of how js normally stores array
    // values not being what is needed here
    // gl.STATIC_DRAW means we are going to send the info from the
    // CPU memory to the GPU memory once - we're not going to change
    // it at all
    // triangleVertexBufferObject isn't called in bufferData because
    // the active buffer is automatically used
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    // Now need to give meaning to the values in attribute vertPosition
    // - currently it is just a list of 6 values; need to understand
    // what the vertices are
    // First we get a location for the attribute - the attribute does
    // have a number position you could work out yourself and use,
    // however it is best to find it with code so that if its
    // numerical position changes due to adding or removing
    // other attributes, the code still works
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colourAttribLocation = gl.getAttribLocation(program, 'vertColour');
    // Now we specify the layout of the attributes, first we'll do position,
    // then colour
    gl.vertexAttribPointer(
        // Attribute location
        positionAttribLocation,
        // Number of elements per attribute
        2,
        // Type of elements
        gl.FLOAT,
        // Whether the data is normalised
        // - worry about this later
        gl.FALSE,
        // Size of an individual vertex - the size of a
        // 32 bit float is 4, but use term so its easier
        // to understand
        5 * Float32Array.BYTES_PER_ELEMENT,
        // Offset from the beginning of a single vertex
        // to this attribute
        0
    );
    gl.vertexAttribPointer(
        // Attribute location
        colourAttribLocation,
        // Number of elements per attribute
        3,
        // Type of elements
        gl.FLOAT,
        // Whether the data is normalised
        // - worry about this later
        gl.FALSE,
        // Size of an individual vertex - the size of a
        // 32 bit float is 4, but use term so its easier
        // to understand
        5 * Float32Array.BYTES_PER_ELEMENT,
        // Offset from the beginning of a single vertex
        // to this attribute - do need offset to get to
        // colour values
        2 * Float32Array.BYTES_PER_ELEMENT
    );
    // Now need to enable vertexAttribArray - enables the attribute
    // for use
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colourAttribLocation);

    // Now we need the main render loop - in a game this would be
    // perhaps a while loop, but now we are just drawing a triangle
    // First specify whcih program we want to use
    gl.useProgram(program);
    // Draw awways uses whichever buffer is actively bound
    // - we are drawing trianlges; second parameter is how many
    // vertexes we want to skip (in this case 0); third dparamter
    // is how many verices we need to actually draw.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}