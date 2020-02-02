precision mediump float;

// As we are now working in 3D space, we make vertPosition
// a vec3.
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
// Now we are using texture coordinates rather than colours
// (these are vec2s rather than vec3s).
varying vec2 fragTexCoord;
// The matrices we will be using for transformations are the
// same for every vertex, but are still inputs.
// We will therfore use uniforms.
// mat4 is a 4x4 matrix from glMatrix.
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
   fragTexCoord = vertTexCoord;
// In matrix multiplication, operations are carried out in
// order from right to left - so in this example, first
// there is a position, then it is multiplied by the mWorld
// matrix (rotating it in 3D space), then it is multiplied
// by mView (where our camera is sitting), then it is
// multiplied by mProj (to get us nice points).
   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}