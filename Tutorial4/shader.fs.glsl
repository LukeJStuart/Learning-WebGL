precision mediump float;

varying vec2 fragTexCoord;
// Samplers work a bit differently to other uniforms -
// rather than using getUniform4fv etc. you just use
// them numbered as they appear here, so this sampler
// is texture 0 - this sampler pulls from texture 0.
uniform sampler2D sampler;

void main()
{
   gl_FragColor = texture2D(sampler, fragTexCoord);
}