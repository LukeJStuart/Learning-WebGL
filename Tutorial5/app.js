var InitDemo = function () {
    Promise.all([
        loadTextResource('/shader.vs.glsl'),
        loadTextResource('/shader.fs.glsl'),
        loadJSONResource('/Susan.json'),
        loadImage('/SusanTexture.png')
    ]).then((message) => {
        console.log('All promises passed');
        RunDemo(message[0], message[1], message[2], message[3]);
    }).catch((message) => {
        console.log('Error; Promise Message: ' + message)
    })
    // N.B. Not sure why the catch case catches for errors
    // in RunDemo.
}

var RunDemo = function (vertexShaderText, fragmentShaderText, SusanModel, SusanImage) {
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

    // Taking vertices for monkey from JSON of mesh.
    var susanVertices = SusanModel.meshes[0].vertices;
    // We use an index array to reduce repetiton
    // of vertices in the vertex array - each
    // set of 3 numbers is the set of indices
    // for the vertexes in the vertex array that
    // make up a particular triangle.
    // Taking indices for monkey from JSON of mesh.
    // Using concat so we don't get a list of lists.
    var susanIndices = [].concat.apply([], SusanModel.meshes[0].faces);
    // Getting texture coordinates for monkey from mesh.
    // N.B that the mesh format supports multiple textures - 
    // in this case, we only want the first one.
    var susanTexCoords = SusanModel.meshes[0].texturecoords[0];
    // Getting normals of vertices of monkey from mesh -
    // these are needed for lighting.
    var susanNormals = SusanModel.meshes[0].normals;

    var susanPosVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

    // Need a buffer for the texture coordinates
    var susanTexCoordVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

    // Now need a buffer for the indices
    var susanIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);

    // Need a buffer for the normals
    var susanNormalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW);

    // Use different buffers now for each of the following attributes.
    gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        // Now that we have z coords, attribute length
        // is 3.
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(
        texCoordAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
    var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
    gl.vertexAttribPointer(
        normalAttribLocation,
        3,
        gl.FLOAT,
        // Data in this case is normalised.
        gl.TRUE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.enableVertexAttribArray(normalAttribLocation);
    
    // Creating texture
    var susanTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, susanTexture);
    // Flipping texture due to difference between how FXB and
    // WebGL use textures.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Setting wrapping for both coordinates, S and T are equivalents to
    // U and V coordinates.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Setting how a value is chosen (as size od where texture is
    // displayed will not be the same size as the texture).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		SusanImage
	);
    // It is good practice to unbind all buffers after you
    // load them in
    gl.bindTexture(gl.TEXTURE_2D, null);

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

        // Binding texture and setting to first sampler (position 0).
        gl.bindTexture(gl.TEXTURE_2D, susanTexture);
        gl.activeTexture(gl.TEXTURE0);

        // Drawing - now using the index buffer instead of the
        // vertex buffer.
        // gl.UNSIGNED_SHORT is because we are storing the indices
        // as integers in shorts.
        // susanIndices.length gives the number of points to be drawn.
        gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    // requestAnimationFrame calls the supplied function every time
    // the screen is ready to draw a new image (normally every
    // 60th of a second); it will also not call the function if the
    // tab is out of focus - good for power saving.
    requestAnimationFrame(loop);
}
