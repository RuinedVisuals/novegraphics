'use client';

import { useEffect, useRef, type RefObject } from 'react';
import styles from './MegaMenu.module.scss';

const TEXT_LINES = ['DIGGING', 'CULTURE'];

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// The motto is drawn into a texture; the shader warps it around the cursor
// (smooth lens + liquid wobble + radial chromatic split) with fine film grain.
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
uniform float uVel;
uniform float uBoost;
uniform float uReveal;

// sin-free hashes: sin() of large arguments is unreliable on some GPUs
float hash(float n) {
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}
float hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);

  vec2 d = (uv - uMouse) * asp;
  float dist = length(d);
  float infl = exp(-dist * dist * 7.0);
  float power = infl * (0.6 + uVel * 4.0 + uBoost * 1.2);

  // smooth lens: magnify / pinch the text around the cursor
  vec2 w = uv - (uv - uMouse) * infl * (0.07 + uBoost * 0.03);

  // soft liquid wobble, stronger near the cursor (smooth noise, no hard steps)
  vec2 q = uv * vec2(3.0, 5.0) + vec2(uTime * 0.25, -uTime * 0.18);
  w += (vec2(vnoise(q), vnoise(q + 7.3)) - 0.5) * (0.001 + power * 0.003);

  // slow vertical roll, like a bad tracking signal
  w.x += sin(uv.y * 9.0 + uTime * 1.3) * 0.0008 * (1.0 + power * 2.0);

  // chromatic aberration, radial from the cursor
  vec2 dir = normalize(d + 1e-4) / asp;
  vec2 off = dir * (0.0012 + power * 0.014);
  float r = texture2D(uTex, w + off).a;
  float g = texture2D(uTex, w).a;
  float b = texture2D(uTex, w - off).a;

  // dim base text, lit up by the cursor
  float lit = 0.2 + infl * 0.9 + uBoost * 0.1;
  // base ink is --red-dark (#8b1a14)
  vec3 col = vec3(r * 0.545, g * 0.102, b * 0.078) * lit * 1.35;
  col += vec3(g) * infl * infl * 0.4;

  // background glow
  col += vec3(0.03, 0.0, 0.0) * (1.0 - uv.y * 0.6) + vec3(0.05, 0.0, 0.0) * infl;

  // fine animated film grain (per pixel, multiplicative + additive)
  float n = hash2(gl_FragCoord.xy + fract(uTime) * 173.0);
  col *= 0.8 + 0.4 * n;
  col += (n - 0.5) * (0.14 + power * 0.1);

  col *= 1.0 - 0.55 * dot(uv - 0.5, uv - 0.5);

  col = clamp(col * uReveal, 0.0, 1.0);
  if (col.r != col.r || col.g != col.g || col.b != col.b) col = vec3(0.0); // NaN guard
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[VhsCanvas] shader compile failed:', gl.getShaderInfoLog(sh));
  }
  return sh;
}

interface Props {
  active: boolean;
  /** 0..1, set by the menu items on hover to push the effect harder */
  boostRef: RefObject<number>;
}

export default function VhsCanvas({ active, boostRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeRef.current = active;
    syncRef.current?.();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[VhsCanvas] program link failed:', gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u('uRes');
    const uMouse = u('uMouse');
    const uTime = u('uTime');
    const uVel = u('uVel');
    const uBoost = u('uBoost');
    const uReveal = u('uReveal');

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let width = 1;
    let height = 1;

    function buildTexture() {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d')!;
      const family =
        getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
        "'Bebas Neue', Impact, sans-serif";

      ctx.font = `100px ${family}`;
      const widest = Math.max(...TEXT_LINES.map((l) => ctx.measureText(l).width));
      const size = Math.min((width * 0.86 * 100) / widest, height * 0.42);
      ctx.font = `${size}px ${family}`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      TEXT_LINES.forEach((line, i) => {
        ctx.fillText(line, width / 2, height / 2 + (i - 0.5) * size * 0.92);
      });

      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, c);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(canvas!.clientWidth * dpr));
      height = Math.max(1, Math.floor(canvas!.clientHeight * dpr));
      canvas!.width = width;
      canvas!.height = height;
      gl!.viewport(0, 0, width, height);
      buildTexture();
    }

    // pointer state (uv, y up); smoothed towards the target each frame
    const target = { x: 0.5, y: 0.5 };
    const mouse = { x: 0.5, y: 0.5 };
    let vel = 0;
    let lastMove = -Infinity;
    let raf = 0;
    let running = false;
    let openedAt = 0;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
      lastMove = performance.now();
    };

    function frame(now: number) {
      const t = now / 1000;

      // no pointer for a while (touch screens too): drift on a slow path
      if (!reduced && now - lastMove > 2500) {
        target.x = 0.5 + 0.3 * Math.sin(t * 0.6);
        target.y = 0.5 + 0.2 * Math.sin(t * 0.9 + 1);
      }

      const px = mouse.x;
      const py = mouse.y;
      mouse.x += (target.x - mouse.x) * 0.12;
      mouse.y += (target.y - mouse.y) * 0.12;
      const speed = Math.hypot(mouse.x - px, mouse.y - py);
      vel += (Math.min(speed * 12, 1) - vel) * 0.15;

      const boost = boostRef.current ?? 0;
      const reveal = Math.max(0, Math.min(1, (now - openedAt) / 700));

      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(uRes, width, height);
      gl!.uniform2f(uMouse, reduced ? 0.5 : mouse.x, reduced ? 0.5 : mouse.y);
      gl!.uniform1f(uTime, reduced ? 0 : t % 1000); // keep the value small for float precision
      gl!.uniform1f(uVel, reduced ? 0 : vel);
      gl!.uniform1f(uBoost, reduced ? 0 : boost);
      gl!.uniform1f(uReveal, reveal);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      if (running) raf = requestAnimationFrame(frame);
    }

    // start drawing when the menu opens; idle the GPU shortly after it closes
    function sync() {
      if (activeRef.current) {
        clearTimeout(stopTimer);
        if (running) return;
        running = true;
        openedAt = performance.now();
        resize();
        raf = requestAnimationFrame(frame);
      } else if (running) {
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
          running = false;
          cancelAnimationFrame(raf);
        }, 900);
      }
    }
    syncRef.current = sync;

    const ro = new ResizeObserver(() => {
      if (running) resize();
    });
    ro.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });

    // the motto texture needs the display font
    document.fonts?.ready.then(() => {
      if (running) buildTexture();
    });

    sync();

    return () => {
      syncRef.current = null;
      clearTimeout(stopTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [boostRef]);

  return <canvas ref={canvasRef} className={styles.vhsCanvas} />;
}
