precision mediump float;

// Struct for directional lights
struct DirectionalLight
{
   vec3 direction;
   vec3 colour;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;
// Uniforms for lighting values
uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
// Samplers work a bit differently to other uniforms -
// rather than using getUniform4fv etc. you just use
// them numbered as they appear here, so this sampler
// is texture 0 - this sampler pulls from texture 0.
uniform sampler2D sampler;

void main()
{
   // Need to normalise the direction of the sun.
   vec3 normSunDir = normalize(sun.direction);
   // The rasterisation process tends to denormalise vectors,
   // therefore it is good to take this step.
   vec3 surfaceNormal = normalize(fragNormal);
   // This gets the colour we previously would have sent
   // directly to gl_FragColor
   vec4 texel = texture2D(sampler, fragTexCoord);
   // Calculating light intensity (ambient + diffuse).
   // N.B we use max with 0.0 because we don't want
   // negative values.
   vec3 lightIntensity = ambientLightIntensity +
      sun.colour * max(dot(surfaceNormal, normSunDir), 0.0);
   // N.B. when displaying normals as colours, x
   // corresponds to red, y corresponds to green, and
   // z corresponds to blue.
   // Need a vec4 but lightIntensity is a vec3, so do
   // multiplication with texel.rgb then add texel.a.
   gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}