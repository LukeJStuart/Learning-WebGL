var vertexShaderText =
[
'precision mediump float;',
'',
// As we are now working in 3D space, we make vertPosition
// a vec3.
'attribute vec3 vertPosition;',
'attribute vec3 vertColour;',
'varying vec3 fragColour;',
// The matrices we will be using for transformations are the
// same for every vertex, but are still inputs.
// We will therfore use uniforms.
// mat4 is a 4x4 matrix from glMatrix.
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'   fragColour = vertColour;',
// In matrix multiplication, operations are carried out in
// order from right to left - so in this example, first
// there is a position, then it is multiplied by the mWorld
// matrix (rotating it in 3D space), then it is multiplied
// by mView (where our camera is sitting), then it is
// multiplied by mProj (to get us nice points).
'   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColour;',
'',
'void main()',
'{',
'   gl_FragColor = vec4(fragColour, 1.0);',
'}'
].join('\n');

var InitDemo = function () {
    console.log('This is working.');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGl.');
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Enabling rasteriser to take depth into consideration.
    gl.enable(gl.DEPTH_TEST);
    // Preventing unnecessary maths being done for the faces
    // of the cube that are out of view.
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,  1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,   1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,   0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,  0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,  0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,  0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,   0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,  0.5, 0.5, 1.0
	];

    // We use an index array to reduce repetiton
    // of vertices in the vertex array - each
    // set of 3 numbers is the set of indices
    // for the vertexes in the vertex array that
    // make up a particular triangle.
	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    // Now need a buffer for the indices
    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colourAttribLocation = gl.getAttribLocation(program, 'vertColour');

    gl.vertexAttribPointer(
        positionAttribLocation,
        // Now that we have z coords, attribute length
        // is 3.
        3,
        gl.FLOAT,
        gl.FALSE,
        // There are now 6 values per vertex.
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        colourAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        // There are now 6 values per vertex.
        6 * Float32Array.BYTES_PER_ELEMENT,
        // Greater coordinate length means greater
        // offset for colour.
        3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colourAttribLocation);

    // Tell state machine which program should be active.
    gl.useProgram(program);

    // Setting uniforms
    //Getting locations
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    // Setting initial values to 4x4 arrays of 0s
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    // Setting values of the matrices
    glMatrix.mat4.identity(worldMatrix);
    // Using lookAt - need position of viewer, potisition viewer
    // is looking at, and which way is up.
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    // Using perspective - need fov, aspect ratio, nearest bound
    // of what is shown and furtherest bound of what is shown
    // (good idea to have these within 5 or 6 orders of
    // magnitude of eachother).
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.clientHeight, 0.1, 1000.0);
    // Now we need to send the matrices to our shader
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix)
    
    // Defining two rotation matrices to use so that the cube rotates
    // in  multiple ways.
    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    // Main render loop
    // Every game is going to have a loop that updates as frequently
    // as the computer is able to process it - in this case this
    // will rotate the object around.
    // Traditionally it is not a good idea to define new variables
    // inside your loop, as memory allocation takes a while.
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        // performance.now gets the number of miliseconds since your
        // window started.
        // This sum means one full rotation every 6 seconds.
        var angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        // Performing rotation on two matrices and then multiplying
        // them and outputting the result to worldMatrix, then 
        // updating the uniform in the vertex shader.
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)

        // Clearing content from the previous frame
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        // Drawing - now using the index buffer instead of the
        // vertex buffer.
        // gl.UNSIGNED_SHORT is because we are storing the indices
        // as integers in shorts.
        // boxIndices.length gives the number of points to be drawn.
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    // requestAnimationFrame calls the supplied function every time
    // the screen is ready to draw a new image (normally every
    // 60th of a second); it will also not call the function if the
    // tab is out of focus - good for power saving.
    requestAnimationFrame(loop);
}

// NOTE - REACHED 14:52 INTO VIDEO 2