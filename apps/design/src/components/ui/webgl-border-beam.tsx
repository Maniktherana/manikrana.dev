"use client";

import * as React from "react";

import { glimmPalettes, type GlimmPalette, type GlimmPaletteName } from "@/components/ui/glimm";
import { cn } from "@/lib/utils";

type WebGLBorderBeamDirection = "clockwise" | "counterclockwise";
type WebGLBorderBeamEasing =
  | "linear"
  | "cubic-bezier(0.45,0,0.55,1)"
  | "cubic-bezier(0.76,0,0.24,1)"
  | "cubic-bezier(0.3,0,0.2,1)";
type WebGLBorderBeamSide = "top" | "right" | "bottom" | "left";

type WebGLBorderBeamProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  active?: boolean;
  around?: boolean;
  borderRadius?: number;
  borderBrightness?: number;
  borderWidth?: number;
  children: React.ReactNode;
  direction?: WebGLBorderBeamDirection;
  duration?: number;
  easing?: WebGLBorderBeamEasing;
  innerGlowBrightness?: number;
  palette?: GlimmPaletteName | GlimmPalette;
  pauseMs?: number;
  side?: WebGLBorderBeamSide;
};

type WebGLBorderBeamController = {
  destroy: () => void;
  setActive: (active: boolean) => void;
  setAround: (around: boolean) => void;
  setBorderBrightness: (brightness: number) => void;
  setDirection: (direction: WebGLBorderBeamDirection) => void;
  setDuration: (duration: number) => void;
  setEasing: (easing: WebGLBorderBeamEasing) => void;
  setInnerGlowBrightness: (brightness: number) => void;
  setPalette: (palette: GlimmPalette) => void;
  setPauseMs: (pauseMs: number) => void;
  setSide: (side: WebGLBorderBeamSide) => void;
};

type BeamGeometry = {
  borderRadius: number;
  borderWidth: number;
  boxHeight: number;
  boxWidth: number;
  dpr: number;
};

type BeamGeometryInput = {
  borderRadius?: number;
  borderWidth: number;
};

const vertexShaderSource = `
attribute vec2 a;

void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 uRes;
uniform vec2 uBoxSize;
uniform float uTime;
uniform float uProgress;
uniform float uAlpha;
uniform float uBorderBrightness;
uniform float uBorderRadius;
uniform float uBorderWidth;
uniform float uDpr;
uniform float uHueShift;
uniform float uInnerGlowBrightness;
uniform float uAround;
uniform float uSide;
uniform float uTravelAlpha;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uPalD;

#define PI 3.14159265359

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(2.0 * PI * (c * t + d));
}

vec3 beamPalette(float t) {
  vec3 color = clamp(palette(t, uPalA, uPalB, uPalC, uPalD), 0.0, 1.0);
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  return clamp(mix(vec3(luma), color, 1.45), 0.0, 1.0);
}

float radialField(vec2 uv, vec2 center, vec2 radius) {
  vec2 delta = (uv - center) / radius;

  return exp(-dot(delta, delta) * 1.55);
}

float lineTravelX(float t) {
  return -0.20 + t * 1.40;
}

float lineTravelWidth(float t) {
  return 0.18 + 1.34 * pow(max(0.0, sin(t * PI)), 0.82);
}

float lineRadialField(vec2 uv, float x, float offsetX, float offsetY, float width, float height, float scaleX, float scaleY) {
  vec2 center = vec2(x + offsetX * scaleX, 1.0 + offsetY * scaleY);
  vec2 radius = vec2(width * scaleX, height * scaleY);

  return radialField(uv, center, radius);
}

float roundedRectSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float roundedBorderPerimeter(vec2 halfSize, float radius) {
  float w = max(1.0, halfSize.x);
  float h = max(1.0, halfSize.y);
  float r = clamp(radius, 0.0, max(0.0, min(w, h) - 1.0));
  float straightW = max(1.0, 2.0 * (w - r));
  float straightH = max(1.0, 2.0 * (h - r));
  float arc = PI * 0.5 * max(r, 1.0);

  return 2.0 * straightW + 2.0 * straightH + 4.0 * arc;
}

float roundedBorderProgress(vec2 p, vec2 halfSize, float radius) {
  float w = max(1.0, halfSize.x);
  float h = max(1.0, halfSize.y);
  float r = clamp(radius, 0.0, max(0.0, min(w, h) - 1.0));
  float straightW = max(1.0, 2.0 * (w - r));
  float straightH = max(1.0, 2.0 * (h - r));
  float arc = PI * 0.5 * max(r, 1.0);
  float perimeter = 2.0 * straightW + 2.0 * straightH + 4.0 * arc;
  float x = p.x;
  float y = p.y;
  float coord = 0.0;

  if (y >= h - r && x >= -w + r && x <= w - r) {
    coord = x + w - r;
  } else if (x > w - r && y > h - r) {
    vec2 c = vec2(w - r, h - r);
    float angle = atan(y - c.y, x - c.x);
    coord = straightW + (PI * 0.5 - angle) * r;
  } else if (x >= w - r && y <= h - r && y >= -h + r) {
    coord = straightW + arc + (h - r - y);
  } else if (x > w - r && y < -h + r) {
    vec2 c = vec2(w - r, -h + r);
    float angle = atan(y - c.y, x - c.x);
    coord = straightW + arc + straightH + (0.0 - angle) * r;
  } else if (y <= -h + r && x <= w - r && x >= -w + r) {
    coord = straightW + arc + straightH + arc + (w - r - x);
  } else if (x < -w + r && y < -h + r) {
    vec2 c = vec2(-w + r, -h + r);
    float angle = atan(y - c.y, x - c.x);
    if (angle > 0.0) {
      angle -= 2.0 * PI;
    }
    coord = straightW + arc + straightH + arc + straightW + (-PI * 0.5 - angle) * r;
  } else if (x <= -w + r && y >= -h + r && y <= h - r) {
    coord = straightW + arc + straightH + arc + straightW + arc + (y + h - r);
  } else {
    vec2 c = vec2(-w + r, h - r);
    float angle = atan(y - c.y, x - c.x);
    coord = straightW + arc + straightH + arc + straightW + arc + straightH + (PI - angle) * r;
  }

  return fract(coord / perimeter);
}

void roundedBorderFrame(float progress, vec2 halfSize, float radius, out vec2 point, out vec2 tangent, out vec2 inward) {
  float w = max(1.0, halfSize.x);
  float h = max(1.0, halfSize.y);
  float r = clamp(radius, 0.0, max(0.0, min(w, h) - 1.0));
  float straightW = max(1.0, 2.0 * (w - r));
  float straightH = max(1.0, 2.0 * (h - r));
  float arc = PI * 0.5 * max(r, 1.0);
  float perimeter = 2.0 * straightW + 2.0 * straightH + 4.0 * arc;
  float coord = fract(progress) * perimeter;
  float local = coord;
  float angle = 0.0;
  vec2 center = vec2(0.0);

  if (local <= straightW) {
    point = vec2(-w + r + local, h);
    tangent = vec2(1.0, 0.0);
  } else {
    local -= straightW;

    if (local <= arc) {
      center = vec2(w - r, h - r);
      angle = PI * 0.5 - local / max(r, 1.0);
      point = center + vec2(cos(angle), sin(angle)) * r;
      tangent = vec2(sin(angle), -cos(angle));
    } else {
      local -= arc;

      if (local <= straightH) {
        point = vec2(w, h - r - local);
        tangent = vec2(0.0, -1.0);
      } else {
        local -= straightH;

        if (local <= arc) {
          center = vec2(w - r, -h + r);
          angle = -local / max(r, 1.0);
          point = center + vec2(cos(angle), sin(angle)) * r;
          tangent = vec2(sin(angle), -cos(angle));
        } else {
          local -= arc;

          if (local <= straightW) {
            point = vec2(w - r - local, -h);
            tangent = vec2(-1.0, 0.0);
          } else {
            local -= straightW;

            if (local <= arc) {
              center = vec2(-w + r, -h + r);
              angle = -PI * 0.5 - local / max(r, 1.0);
              point = center + vec2(cos(angle), sin(angle)) * r;
              tangent = vec2(sin(angle), -cos(angle));
            } else {
              local -= arc;

              if (local <= straightH) {
                point = vec2(-w, -h + r + local);
                tangent = vec2(0.0, 1.0);
              } else {
                local -= straightH;
                center = vec2(-w + r, h - r);
                angle = PI - local / max(r, 1.0);
                point = center + vec2(cos(angle), sin(angle)) * r;
                tangent = vec2(sin(angle), -cos(angle));
              }
            }
          }
        }
      }
    }
  }

  inward = vec2(tangent.y, -tangent.x);
}

void fixedSideFrame(float side, vec2 boxSize, out vec2 tangent, out vec2 inward, out float axisSize) {
  tangent = vec2(1.0, 0.0);
  inward = vec2(0.0, 1.0);
  axisSize = boxSize.x;

  if (side > 0.5 && side < 1.5) {
    tangent = vec2(1.0, 0.0);
    inward = vec2(0.0, -1.0);
  } else if (side > 1.5 && side < 2.5) {
    tangent = vec2(0.0, -1.0);
    inward = vec2(-1.0, 0.0);
    axisSize = boxSize.y;
  } else if (side > 2.5 && side < 3.5) {
    tangent = vec2(0.0, -1.0);
    inward = vec2(1.0, 0.0);
    axisSize = boxSize.y;
  }
}

float fixedBorderPathField(
  vec2 p,
  float progress,
  float offsetX,
  float offsetY,
  float width,
  float height,
  vec2 halfSize,
  float radius,
  vec2 fixedTangent,
  vec2 fixedInward
) {
  float perimeter = roundedBorderPerimeter(halfSize, radius);
  vec2 center = vec2(0.0);
  vec2 tangent = vec2(1.0, 0.0);
  vec2 inward = vec2(0.0, -1.0);

  roundedBorderFrame(progress + offsetX * uDpr / perimeter, halfSize, radius, center, tangent, inward);

  vec2 fieldCenter = center - fixedInward * offsetY * uDpr;
  vec2 delta = vec2(dot(p - fieldCenter, fixedTangent), dot(p - fieldCenter, fixedInward)) /
    max(vec2(0.001), vec2(width, height) * uDpr);

  return exp(-dot(delta, delta) * 1.55);
}

void main() {
  vec2 p = gl_FragCoord.xy - uRes * 0.5;
  vec2 halfSize = max(vec2(1.0), uBoxSize * 0.5);
  float radius = clamp(uBorderRadius, 0.0, max(0.0, min(halfSize.x, halfSize.y) - 1.0));
  float sd = roundedRectSdf(p, halfSize, radius);
  float borderWidth = max(0.1 * uDpr, uBorderWidth);
  vec2 uv = p / uBoxSize + 0.5;
  vec2 cssUv = vec2(uv.x, 1.0 - uv.y);

  float borderBrightness = max(uBorderBrightness, 0.0);
  float innerGlowBrightness = max(uInnerGlowBrightness, 0.0);
  float innerGlowAmount = pow(clamp(innerGlowBrightness / 2.0, 0.0, 1.0), 1.35) * 1.35;
  float innerGlowLevel = smoothstep(0.0, 2.0, innerGlowBrightness);
  float innerSpread = 0.76 + innerGlowLevel * 0.76;

  float inside = 1.0 - smoothstep(0.0, 1.0, sd);
  float distanceInside = max(-sd, 0.0);
  float stroke = inside * (1.0 - smoothstep(borderWidth, borderWidth + 1.0, distanceInside));
  float w = 0.0;

  {
    float side = floor(uSide + 0.5);
    float travel = fract(uProgress);
    float lineX = lineTravelX(travel);
    float lineW = lineTravelWidth(travel);
    float lineEdge = uTravelAlpha;
    float lineH = 1.02 + sin(uTime * 2.45) * 0.16 + sin(uTime * 3.75 + 1.9) * 0.12;
    float spike = 1.0 + sin(uTime * 2.38 + 0.3) * 0.16;
    float spikeTwo = 1.0 + sin(uTime * 1.85 + 2.1) * 0.18;
    vec2 beamUv = cssUv;
    vec2 beamSize = uBoxSize;
    float lineWeight = 0.0;
    vec3 lineField = vec3(0.0);

    if (uAround > 0.5) {
      vec2 pathPoint = vec2(0.0);
      vec2 pathTangent = vec2(1.0, 0.0);
      vec2 pathInward = vec2(0.0, -1.0);
      vec2 fixedTangent = vec2(1.0, 0.0);
      vec2 fixedInward = vec2(0.0, 1.0);
      float fixedAxisSize = uBoxSize.x;
      float sideEdge = exp(-pow(distanceInside / (36.0 * innerSpread * uDpr), 1.34));

      roundedBorderFrame(travel, halfSize, radius, pathPoint, pathTangent, pathInward);
      fixedSideFrame(side, uBoxSize, fixedTangent, fixedInward, fixedAxisSize);

      w = fixedBorderPathField(
        p,
        travel,
        0.0,
        2.0,
        44.0 * lineW,
        42.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.84 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        39.0,
        0.0,
        38.0 * lineW,
        38.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.56 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        -36.0,
        2.0,
        41.0 * lineW,
        34.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.28 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        -54.0,
        0.0,
        37.0 * lineW,
        40.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.72 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        51.0,
        -1.0,
        35.0 * lineW,
        36.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.14 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        21.0,
        1.0,
        44.0 * lineW,
        30.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.66 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        -21.0,
        0.0,
        38.0 * lineW,
        28.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.44 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        66.0,
        1.0,
        33.0 * lineW,
        34.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.94 + uHueShift) * w;
      lineWeight += w;

      w = fixedBorderPathField(
        p,
        travel,
        -66.0,
        -1.0,
        31.0 * lineW,
        36.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      lineField += beamPalette(0.36 + uHueShift) * w;
      lineWeight += w;

      float tangentDistance = dot(p - pathPoint, fixedTangent) / max(1.0, fixedAxisSize);
      vec3 lineRibbon = beamPalette(tangentDistance * 2.55 + travel * 0.42 + uHueShift);
      vec3 lobeColor = clamp(lineField / max(lineWeight, 0.001), 0.0, 1.0);
      float lobeLuma = dot(lobeColor, vec3(0.299, 0.587, 0.114));
      lobeColor = clamp(mix(vec3(lobeLuma), lobeColor, 1.35), 0.0, 1.0);
      vec3 lineColor = mix(lineRibbon, clamp(lobeColor, 0.0, 1.0), clamp(lineWeight * 0.9, 0.0, 0.55));
      float lineMask = fixedBorderPathField(
        p,
        travel,
        0.0,
        0.0,
        86.0 * lineW,
        66.0 * lineH,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      float lineBloomMask = fixedBorderPathField(
        p,
        travel,
        0.0,
        0.0,
        94.0 * lineW,
        118.0 * lineH * innerSpread,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      );
      float sourceAlpha = clamp(lineWeight * 1.08 + lineMask * 0.22, 0.0, 1.0);
      float strokeAlpha = lineEdge * stroke * lineMask * sourceAlpha * uAlpha * 1.12 * borderBrightness;
      float glowAlpha = lineEdge * inside * sideEdge * lineBloomMask * uAlpha * 0.20 * innerGlowAmount;
      float bloomAlpha = lineEdge * inside * lineBloomMask * uAlpha * 0.07 * innerGlowAmount;
      float shine = lineEdge * stroke * fixedBorderPathField(
        p,
        travel,
        0.0,
        2.0,
        30.0 * lineW * spike,
        32.0 * lineH * spikeTwo,
        halfSize,
        radius,
        fixedTangent,
        fixedInward
      ) * uAlpha * 0.10 * borderBrightness;
      vec3 chromaUnderpaint = lineRibbon * lineMask * (strokeAlpha + glowAlpha) * 0.46;
      vec3 shineColor = mix(lineColor, vec3(1.0), 0.14);
      vec3 body = lineColor * (strokeAlpha + glowAlpha + bloomAlpha) + chromaUnderpaint + shineColor * shine;

      gl_FragColor = vec4(body, min(strokeAlpha + glowAlpha + bloomAlpha + shine, 1.0));
      return;
    }

    if (side > 0.5 && side < 1.5) {
      beamUv = vec2(cssUv.x, 1.0 - cssUv.y);
    } else if (side > 1.5 && side < 2.5) {
      beamUv = vec2(cssUv.y, cssUv.x);
      beamSize = vec2(uBoxSize.y, uBoxSize.x);
    } else if (side > 2.5 && side < 3.5) {
      beamUv = vec2(cssUv.y, 1.0 - cssUv.x);
      beamSize = vec2(uBoxSize.y, uBoxSize.x);
    }

    float scaleX = uDpr / beamSize.x;
    float scaleY = uDpr / beamSize.y;

    w = lineRadialField(beamUv, lineX, 0.0, 2.0, 44.0 * lineW, 42.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.84 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, 39.0, 0.0, 38.0 * lineW, 38.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.56 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, -36.0, 2.0, 41.0 * lineW, 34.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.28 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, -54.0, 0.0, 37.0 * lineW, 40.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.72 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, 51.0, -1.0, 35.0 * lineW, 36.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.14 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, 21.0, 1.0, 44.0 * lineW, 30.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.66 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, -21.0, 0.0, 38.0 * lineW, 28.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.44 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, 66.0, 1.0, 33.0 * lineW, 34.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.94 + uHueShift) * w;
    lineWeight += w;

    w = lineRadialField(beamUv, lineX, -66.0, -1.0, 31.0 * lineW, 36.0 * lineH, scaleX, scaleY);
    lineField += beamPalette(0.36 + uHueShift) * w;
    lineWeight += w;

    vec3 lineRibbon = beamPalette((beamUv.x - lineX) * 2.55 + travel * 0.42 + uHueShift);
    vec3 lobeColor = clamp(lineField / max(lineWeight, 0.001), 0.0, 1.0);
    float lobeLuma = dot(lobeColor, vec3(0.299, 0.587, 0.114));
    lobeColor = clamp(mix(vec3(lobeLuma), lobeColor, 1.35), 0.0, 1.0);
    vec3 lineColor = mix(lineRibbon, clamp(lobeColor, 0.0, 1.0), clamp(lineWeight * 0.9, 0.0, 0.55));
    float lineMask = radialField(
      beamUv,
      vec2(lineX, 1.0),
      vec2(86.0 * lineW * scaleX, 66.0 * lineH * scaleY)
    );
    float lineBloomMask = radialField(
      beamUv,
      vec2(lineX, 1.0),
      vec2(94.0 * lineW * scaleX, 118.0 * lineH * innerSpread * scaleY)
    );
    float sideDistance = (1.0 - beamUv.y) * beamSize.y;
    float sideEdge = exp(-pow(sideDistance / (36.0 * innerSpread * uDpr), 1.34));
    float sourceAlpha = clamp(lineWeight * 1.08 + lineMask * 0.22, 0.0, 1.0);
    float strokeAlpha = lineEdge * stroke * lineMask * sourceAlpha * uAlpha * 1.12 * borderBrightness;
    float glowAlpha = lineEdge * inside * sideEdge * lineBloomMask * uAlpha * 0.20 * innerGlowAmount;
    float bloomAlpha = lineEdge * inside * lineBloomMask * uAlpha * 0.07 * innerGlowAmount;
    float shine = lineEdge * stroke * radialField(
      beamUv,
      vec2(lineX, 1.0 + 2.0 * scaleY),
      vec2(30.0 * lineW * spike * scaleX, 32.0 * lineH * spikeTwo * scaleY)
    ) * uAlpha * 0.10 * borderBrightness;
    vec3 chromaUnderpaint = lineRibbon * lineMask * (strokeAlpha + glowAlpha) * 0.46;
    vec3 shineColor = mix(lineColor, vec3(1.0), 0.14);
    vec3 body = lineColor * (strokeAlpha + glowAlpha + bloomAlpha) + chromaUnderpaint + shineColor * shine;

    gl_FragColor = vec4(body, min(strokeAlpha + glowAlpha + bloomAlpha + shine, 1.0));
    return;
  }
}
`;

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const sampleCurveX = (t: number) =>
    ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t: number) =>
    ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  const sampleCurveDerivativeX = (t: number) =>
    (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;

  return (x: number) => {
    let t = x;

    for (let i = 0; i < 8; i += 1) {
      const xEstimate = sampleCurveX(t) - x;
      const derivative = sampleCurveDerivativeX(t);

      if (Math.abs(xEstimate) < 0.000001 || Math.abs(derivative) < 0.000001) {
        break;
      }

      t -= xEstimate / derivative;
    }

    return sampleCurveY(Math.min(1, Math.max(0, t)));
  };
}

const easingFunctions: Record<WebGLBorderBeamEasing, (t: number) => number> = {
  linear: (t) => t,
  "cubic-bezier(0.45,0,0.55,1)": cubicBezier(0.45, 0, 0.55, 1),
  "cubic-bezier(0.76,0,0.24,1)": cubicBezier(0.76, 0, 0.24, 1),
  "cubic-bezier(0.3,0,0.2,1)": cubicBezier(0.3, 0, 0.2, 1),
};

function resolveEasing(easing: WebGLBorderBeamEasing | undefined) {
  return easing ? (easingFunctions[easing] ?? easingFunctions.linear) : easingFunctions.linear;
}

function resolveSweepPalette(palette: GlimmPaletteName | GlimmPalette | undefined) {
  if (!palette) return glimmPalettes.prism;
  if (typeof palette === "string") return glimmPalettes[palette];

  return palette;
}

function sideToUniform(side: WebGLBorderBeamSide) {
  if (side === "top") return 1;
  if (side === "right") return 2;
  if (side === "left") return 3;

  return 0;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function detectBorderRadius(target: HTMLElement, fallback: number) {
  const raw = Number.parseFloat(getComputedStyle(target).borderTopLeftRadius);

  return Number.isFinite(raw) ? raw : fallback;
}

function measureBeamGeometry(
  canvas: HTMLCanvasElement,
  target: HTMLElement,
  input: BeamGeometryInput,
): BeamGeometry {
  const dpr = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
  const rect = target.getBoundingClientRect();
  const radius = input.borderRadius ?? detectBorderRadius(target, 16);

  return {
    borderRadius: Math.max(0, radius * dpr),
    borderWidth: Math.max(0.1 * dpr, input.borderWidth * dpr),
    boxHeight: Math.max(1, rect.height * dpr),
    boxWidth: Math.max(1, rect.width * dpr),
    dpr,
  };
}

function createWebGLBorderBeamShader(
  canvas: HTMLCanvasElement,
  target: HTMLElement,
  geometryInput: React.MutableRefObject<BeamGeometryInput>,
  opts: {
    active?: boolean;
    around?: boolean;
    borderBrightness?: number;
    direction?: WebGLBorderBeamDirection;
    duration?: number;
    easing?: WebGLBorderBeamEasing;
    innerGlowBrightness?: number;
    palette?: GlimmPaletteName | GlimmPalette;
    pauseMs?: number;
    side?: WebGLBorderBeamSide;
  } = {},
): WebGLBorderBeamController | null {
  if (typeof window === "undefined") return null;

  const glContext = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });

  if (!glContext) return null;

  const gl: WebGLRenderingContext = glContext;
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.useProgram(program);

  const buffer = gl.createBuffer();

  if (!buffer) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a");

  if (positionLocation >= 0) {
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  const uniforms = {
    alpha: gl.getUniformLocation(program, "uAlpha"),
    around: gl.getUniformLocation(program, "uAround"),
    borderBrightness: gl.getUniformLocation(program, "uBorderBrightness"),
    borderRadius: gl.getUniformLocation(program, "uBorderRadius"),
    borderWidth: gl.getUniformLocation(program, "uBorderWidth"),
    boxSize: gl.getUniformLocation(program, "uBoxSize"),
    dpr: gl.getUniformLocation(program, "uDpr"),
    hueShift: gl.getUniformLocation(program, "uHueShift"),
    innerGlowBrightness: gl.getUniformLocation(program, "uInnerGlowBrightness"),
    palA: gl.getUniformLocation(program, "uPalA"),
    palB: gl.getUniformLocation(program, "uPalB"),
    palC: gl.getUniformLocation(program, "uPalC"),
    palD: gl.getUniformLocation(program, "uPalD"),
    progress: gl.getUniformLocation(program, "uProgress"),
    res: gl.getUniformLocation(program, "uRes"),
    side: gl.getUniformLocation(program, "uSide"),
    time: gl.getUniformLocation(program, "uTime"),
    travelAlpha: gl.getUniformLocation(program, "uTravelAlpha"),
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const state = {
    active: opts.active ?? true,
    alpha: 0,
    around: opts.around ?? false,
    borderBrightness: finiteOr(opts.borderBrightness, 1),
    direction: opts.direction ?? "clockwise",
    duration: Math.max(0.12, finiteOr(opts.duration, 3.1)),
    easing: opts.easing ?? "linear",
    innerGlowBrightness: finiteOr(opts.innerGlowBrightness, 1),
    palette: resolveSweepPalette(opts.palette),
    pauseMs: Math.max(0, finiteOr(opts.pauseMs, 900)),
    side: opts.side ?? "bottom",
  };
  const hueShift = Math.random() * 0.4;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  resize();

  let observer: ResizeObserver | undefined;
  let frame = 0;
  const startedAt = performance.now();

  if (typeof ResizeObserver === "function") {
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    observer.observe(target);
  } else {
    window.addEventListener("resize", resize);
  }

  function tick() {
    resize();

    const time = (performance.now() - startedAt) / 1000;
    const now = performance.now();
    const palette = state.palette;
    const geometry = measureBeamGeometry(canvas, target, geometryInput.current);
    const durationMs = state.duration * 1000;
    const loopsAround = state.around;
    const totalMs = loopsAround ? durationMs : durationMs + state.pauseMs;
    const cycleMs = (now - startedAt) % totalMs;
    const rawProgress = Math.min(1, cycleMs / durationMs);
    const easedProgress = resolveEasing(state.easing)(rawProgress);
    const progress = state.direction === "clockwise" ? easedProgress : 1 - easedProgress;
    const travelAlpha = loopsAround || cycleMs < durationMs ? 1 : 0;
    const targetAlpha = state.active ? 1 : 0;

    state.alpha += (targetAlpha - state.alpha) * 0.09;
    if (Math.abs(targetAlpha - state.alpha) < 0.001) {
      state.alpha = targetAlpha;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.res, canvas.width, canvas.height);
    gl.uniform2f(uniforms.boxSize, geometry.boxWidth, geometry.boxHeight);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.progress, progress);
    gl.uniform1f(uniforms.alpha, state.alpha);
    gl.uniform1f(uniforms.borderBrightness, state.borderBrightness);
    gl.uniform1f(uniforms.borderRadius, geometry.borderRadius);
    gl.uniform1f(uniforms.borderWidth, geometry.borderWidth);
    gl.uniform1f(uniforms.dpr, geometry.dpr);
    gl.uniform1f(uniforms.innerGlowBrightness, state.innerGlowBrightness);
    gl.uniform1f(uniforms.around, state.around ? 1 : 0);
    gl.uniform1f(uniforms.side, sideToUniform(state.side));
    gl.uniform1f(uniforms.travelAlpha, travelAlpha);
    gl.uniform1f(uniforms.hueShift, hueShift);
    gl.uniform3f(uniforms.palA, palette.a[0], palette.a[1], palette.a[2]);
    gl.uniform3f(uniforms.palB, palette.b[0], palette.b[1], palette.b[2]);
    gl.uniform3f(uniforms.palC, palette.c[0], palette.c[1], palette.c[2]);
    gl.uniform3f(uniforms.palD, palette.d[0], palette.d[1], palette.d[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    frame = window.requestAnimationFrame(tick);
  }

  frame = window.requestAnimationFrame(tick);

  return {
    destroy: () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    },
    setActive: (active) => {
      state.active = active;
    },
    setAround: (around) => {
      state.around = around;
    },
    setBorderBrightness: (brightness) => {
      state.borderBrightness = brightness;
    },
    setDirection: (direction) => {
      state.direction = direction;
    },
    setDuration: (duration) => {
      state.duration = Math.max(0.12, duration);
    },
    setEasing: (easing) => {
      state.easing = easing;
    },
    setInnerGlowBrightness: (brightness) => {
      state.innerGlowBrightness = brightness;
    },
    setPalette: (palette) => {
      state.palette = palette;
    },
    setPauseMs: (pauseMs) => {
      state.pauseMs = Math.max(0, pauseMs);
    },
    setSide: (side) => {
      state.side = side;
    },
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReduced(query.matches);

    const update = () => setReduced(query.matches);

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

const WebGLBorderBeam = React.forwardRef<HTMLDivElement, WebGLBorderBeamProps>(
  function WebGLBorderBeam(
    {
      active = true,
      around = false,
      borderRadius,
      borderBrightness = 1,
      borderWidth = 1,
      children,
      className,
      direction = "clockwise",
      duration = 3.1,
      easing = "linear",
      innerGlowBrightness = 1,
      palette = "prism",
      pauseMs = 900,
      side = "bottom",
      style,
      ...props
    },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const canvasHostRef = React.useRef<HTMLSpanElement | null>(null);
    const controllerRef = React.useRef<WebGLBorderBeamController | null>(null);
    const reducedMotion = usePrefersReducedMotion();
    const geometryInputRef = React.useRef<BeamGeometryInput>({
      borderRadius,
      borderWidth,
    });
    const shaderOptionsRef = React.useRef({
      active,
      around,
      borderBrightness,
      direction,
      duration,
      easing,
      innerGlowBrightness,
      palette,
      pauseMs,
      side,
    });

    geometryInputRef.current = {
      borderRadius,
      borderWidth,
    };
    shaderOptionsRef.current = {
      active,
      around,
      borderBrightness,
      direction,
      duration,
      easing,
      innerGlowBrightness,
      palette,
      pauseMs,
      side,
    };

    React.useEffect(() => {
      const controller = controllerRef.current;

      if (!controller) return;

      controller.setActive(active);
      controller.setAround(around);
      controller.setBorderBrightness(borderBrightness);
      controller.setDirection(direction);
      controller.setDuration(duration);
      controller.setEasing(easing);
      controller.setInnerGlowBrightness(innerGlowBrightness);
      controller.setPalette(resolveSweepPalette(palette));
      controller.setPauseMs(pauseMs);
      controller.setSide(side);
    }, [
      active,
      around,
      borderBrightness,
      direction,
      duration,
      easing,
      innerGlowBrightness,
      palette,
      pauseMs,
      side,
    ]);

    React.useEffect(() => {
      if (reducedMotion) return undefined;

      const container = containerRef.current;
      const host = canvasHostRef.current;

      if (!container || !host) return undefined;

      const target = container.firstElementChild;

      if (!(target instanceof HTMLElement)) return undefined;

      const canvas = document.createElement("canvas");

      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        display: "block",
        height: "100%",
        inset: "0",
        pointerEvents: "none",
        position: "absolute",
        width: "100%",
      });

      host.appendChild(canvas);

      const controller = createWebGLBorderBeamShader(
        canvas,
        target,
        geometryInputRef,
        shaderOptionsRef.current,
      );

      if (!controller) {
        canvas.remove();
        return undefined;
      }

      controllerRef.current = controller;

      return () => {
        controller.destroy();
        controllerRef.current = null;
        canvas.remove();
      };
    }, [reducedMotion]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <div
        {...props}
        data-slot="webgl-border-beam"
        ref={setRefs}
        className={cn("relative isolate inline-block overflow-hidden", className)}
        style={style}
      >
        {children}
        <span
          aria-hidden="true"
          ref={canvasHostRef}
          className="pointer-events-none absolute inset-0 z-20 block overflow-hidden"
        />
      </div>
    );
  },
);

export { WebGLBorderBeam };
export type {
  WebGLBorderBeamDirection,
  WebGLBorderBeamEasing,
  WebGLBorderBeamProps,
  WebGLBorderBeamSide,
};
