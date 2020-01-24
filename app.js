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

    // Starting by clearing to a flat backgorund colour
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    // Nothing will have happened yet, just 'set paint colour'
    // Now need to tell it what to clear in order to 'apply the paint'
    // N.B. colour buffer stores what colours all the pixels should be;
    // depth buffer stores how 'deep into the screen' a pixel is (good for
    // e.g. drawing something in front of something else)
    // For good practice, we will clear both of these buffers, eventhough
    // just clearing the colour buffer would work
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}