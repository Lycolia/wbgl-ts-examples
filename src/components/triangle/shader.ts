export const vertex = `
attribute vec3 position;
attribute vec4 color;
uniform   mat4 mvpMatrix;
varying   vec4 vColor;

void main(void) {
    vColor = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
`;

export const fragment = `
precision mediump float;
varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;
