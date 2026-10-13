export const BUFFER_SIZE = 512;

type Vec3 = readonly [number, number, number];
export type Uniforms = Record<string, number | Vec3>;

type Program = {
  handle: WebGLProgram;
  locations: Map<string, WebGLUniformLocation | null>;
};

const POSITION = 0;

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const PRELUDE = `
precision highp float;
uniform float resolution;
uniform float time;
uniform float activity;
uniform float search;
uniform float focus;
uniform float brilliance;
mat2 rotate(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
`;

const MAIN = `
void main() {
  vec2 uv = (gl_FragCoord.xy / resolution * 2.0 - 1.0) * 1.12;
  float rr = dot(uv, uv);
  if (rr >= 1.0) { gl_FragColor = vec4(0.0); return; }
  float edge = 1.0 - smoothstep(1.0 - 2.24 / resolution, 1.0, sqrt(rr));
  gl_FragColor = paint(uv, rr, edge);
}
`;

export function orbFragment(body: string) {
  return PRELUDE + body + MAIN;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("Orb shader compilation failed:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext, fragment: string): Program | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
  const handle = gl.createProgram();
  let linked = false;
  if (vertexShader && fragmentShader && handle) {
    gl.attachShader(handle, vertexShader);
    gl.attachShader(handle, fragmentShader);
    // Every program reads `position` from attribute 0, so one buffer binding serves them all.
    gl.bindAttribLocation(handle, POSITION, "position");
    gl.linkProgram(handle);
    linked = gl.getProgramParameter(handle, gl.LINK_STATUS);
  }
  if (vertexShader) gl.deleteShader(vertexShader);
  if (fragmentShader) gl.deleteShader(fragmentShader);
  if (linked && handle) return { handle, locations: new Map() };
  if (handle) gl.deleteProgram(handle);
  return null;
}

function createRenderer() {
  const surface = document.createElement("canvas");
  surface.width = surface.height = BUFFER_SIZE;
  const gl = surface.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(POSITION);
  gl.vertexAttribPointer(POSITION, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.SCISSOR_TEST);
  const programs = new Map<string, Program | null>();

  return {
    program(fragment: string) {
      if (!programs.has(fragment)) programs.set(fragment, createProgram(gl, fragment));
      return programs.get(fragment) ?? null;
    },
    draw(context: CanvasRenderingContext2D, pixels: number, program: Program, uniforms: Uniforms) {
      if (gl.isContextLost()) return false;
      gl.useProgram(program.handle);
      gl.viewport(0, 0, pixels, pixels);
      gl.scissor(0, 0, pixels, pixels);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const [name, value] of Object.entries(uniforms)) {
        let location = program.locations.get(name);
        if (location === undefined) {
          location = gl.getUniformLocation(program.handle, name);
          program.locations.set(name, location);
        }
        if (typeof value === "number") gl.uniform1f(location, value);
        else gl.uniform3fv(location, value);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      context.clearRect(0, 0, pixels, pixels);
      context.drawImage(surface, 0, BUFFER_SIZE - pixels, pixels, pixels, 0, 0, pixels, pixels);
      return true;
    },
    dispose() {
      programs.forEach((program) => program && gl.deleteProgram(program.handle));
      gl.deleteBuffer(buffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

// One WebGL context shared by every orb, since browsers cap live contexts.
let renderer: ReturnType<typeof createRenderer> = null;
let consumers = 0;

function release() {
  consumers -= 1;
  if (consumers > 0) return;
  renderer?.dispose();
  renderer = null;
}

export function acquirePainter(fragment: string) {
  renderer ??= createRenderer();
  consumers += 1;
  const current = renderer;
  const program = current?.program(fragment);
  if (!current || !program) {
    release();
    return null;
  }
  return {
    draw: (context: CanvasRenderingContext2D, pixels: number, uniforms: Uniforms) =>
      current.draw(context, pixels, program, uniforms),
    release,
  };
}
