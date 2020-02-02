precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;
// Samplers work a bit differently to other uniforms -
// rather than using getUniform4fv etc. you just use
// them numbered as they appear here, so this sampler
// is texture 0 - this sampler pulls from texture 0.
uniform sampler2D sampler;

void main()
{
   // Lighting values - note that the direction of the
   // sunlight should be normalised.
   vec3 ambientLightIntensity = vec3(0.1, 0.1, 0.2);
   vec3 sunlightIntensity = vec3(0.7, 0.6, 0.4);
   vec3 sunlightDirection = normalize(vec3(1.0, -4.0, 0.0));
   // This gets the colour we previously would have sent
   // directly to gl_FragColor
   vec4 texel = texture2D(sampler, fragTexCoord);
   // Calculating light intensity (ambient + diffuse).
   // N.B we use max with 0.0 because we don't want
   // negative values.
   vec3 lightIntensity = ambientLightIntensity +
      sunlightIntensity * max(dot(fragNormal, sunlightDirection), 0.0);
   // N.B. when displaying normals as colours, x
   // corresponds to red, y corresponds to green, and
   // z corresponds to blue.
   gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}