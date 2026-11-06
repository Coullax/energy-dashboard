"use client";

import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  RotateCcw,
  Move3D,
  Layers,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { energy, format, type Unit } from "@/lib/energy";

type GeoFeature = {
  properties: { id: string; name: string; province: string };
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
};
type Geography = { features: GeoFeature[] };
type Metric = {
  id: string;
  name: string;
  value: number;
  share: number;
  renewableShare: number;
};
const project = ([lng, lat]: number[]) => [
  (lng - 80.75) * 1.98,
  (lat - 7.9) * 2,
];
export function SriLankaMap({
  metrics,
  selected,
  onSelect,
  unit,
  metric,
}: {
  metrics: Metric[];
  selected: string;
  onSelect: (name: string) => void;
  unit: Unit;
  metric: "consumption" | "renewable";
}) {
  const container = useRef<HTMLDivElement>(null),
    api = useRef<{ zoom: (amount: number) => void; reset: () => void } | null>(
      null,
    );
  const [geo, setGeo] = useState<Geography | null>(null),
    [fallback, setFallback] = useState(false),
    [error, setError] = useState(""),
    [hover, setHover] = useState<Metric | null>(null),
    [reset, setReset] = useState(0);
  const onPick = useRef(onSelect);
  useEffect(() => {
    onPick.current = onSelect;
  }, [onSelect]);
  const position = useRef<number[] | null>(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/data/sri-lanka-districts.geojson", { signal: c.signal })
      .then((r) => {
        if (!r.ok) throw Error("The district map could not be loaded.");
        return r.json();
      })
      .then(setGeo)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, []);
  useEffect(() => {
    if (!geo || !container.current || fallback) return;
    let dispose = () => {},
      cancelled = false;
    async function mount() {
      const THREE = await import("three");
      const { OrbitControls } =
        await import("three/addons/controls/OrbitControls.js");
      if (cancelled || !container.current) return;
      const host = container.current;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        setFallback(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x112b2a, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute(
        "aria-label",
        "Interactive 3D Sri Lanka district map. Drag to orbit, scroll to zoom, click a district. District buttons provide keyboard access.",
      );
      renderer.domElement.setAttribute("role", "img");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.fromArray(position.current ?? [2, 12, 8]);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minDistance = 7;
      controls.maxDistance = 22;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minPolarAngle = 0.12;
      controls.target.set(0, 0.3, 0);
      controls.update();
      scene.add(new THREE.AmbientLight(0xcaf9df, 2));
      const sun = new THREE.DirectionalLight(0xffffff, 3.4);
      sun.position.set(-3, 10, 6);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x87e6d3, 1.5);
      rim.position.set(5, 3, -5);
      scene.add(rim);
      const grid = new THREE.GridHelper(18, 36, 0x34665c, 0x24463e);
      grid.position.y = -0.09;
      scene.add(grid);
      const meshes: InstanceType<typeof THREE.Mesh>[] = [];
      const resources: { dispose: () => void }[] = [];
      const maximum = Math.max(...metrics.map((m) => m.value), 0.001);
      for (const f of geo!.features) {
        const m = metrics.find((m) => m.id === f.properties.id);
        if (!m) continue;
        const polygons =
          f.geometry.type === "Polygon"
            ? [f.geometry.coordinates as number[][][]]
            : (f.geometry.coordinates as number[][][][]);
        const height = 0.055 + (m.value / maximum) * 1.25;
        const intensity =
          metric === "renewable" ? m.renewableShare / 100 : m.value / maximum;
        const color = new THREE.Color("#265e54").lerp(
          new THREE.Color(metric === "renewable" ? "#d4f8a1" : "#b7e7a1"),
          intensity,
        );
        for (const polygon of polygons) {
          if (!polygon[0] || polygon[0].length < 4) continue;
          const shape = new THREE.Shape(
            polygon[0].map((p) => {
              const [x, y] = project(p);
              return new THREE.Vector2(x, y);
            }),
          );
          for (const hole of polygon.slice(1))
            shape.holes.push(
              new THREE.Path(
                hole.map((p) => {
                  const [x, y] = project(p);
                  return new THREE.Vector2(x, y);
                }),
              ),
            );
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: height,
            bevelEnabled: false,
            steps: 1,
          });
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.62,
            metalness: 0.08,
            emissive: m.name === selected ? "#4f8557" : "#000000",
            emissiveIntensity: 0.3,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.metric = m;
          scene.add(mesh);
          meshes.push(mesh);
          resources.push(geometry, material);
          const edges = new THREE.EdgesGeometry(geometry, 22);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: m.name === selected ? 0xe7ffb6 : 0x6caa8d,
            transparent: true,
            opacity: m.name === selected ? 0.95 : 0.32,
          });
          scene.add(new THREE.LineSegments(edges, lineMaterial));
          resources.push(edges, lineMaterial);
        }
      }
      const pointer = new THREE.Vector2(),
        ray = new THREE.Raycaster();
      let down = [0, 0],
        frame = 0;
      const intersect = (e: PointerEvent) => {
        const b = renderer.domElement.getBoundingClientRect();
        pointer.set(
          ((e.clientX - b.left) / b.width) * 2 - 1,
          (-(e.clientY - b.top) / b.height) * 2 + 1,
        );
        ray.setFromCamera(pointer, camera);
        return ray.intersectObjects(meshes, false)[0]?.object.userData
          .metric as Metric | undefined;
      };
      const move = (e: PointerEvent) => {
        const m = intersect(e);
        setHover(m ?? null);
        renderer.domElement.style.cursor = m ? "pointer" : "grab";
      };
      const press = (e: PointerEvent) => {
        down = [e.clientX, e.clientY];
      };
      const release = (e: PointerEvent) => {
        if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6) {
          const m = intersect(e);
          if (m) onPick.current(m.name);
        }
      };
      const leave = () => setHover(null);
      renderer.domElement.addEventListener("pointermove", move);
      renderer.domElement.addEventListener("pointerdown", press);
      renderer.domElement.addEventListener("pointerup", release);
      renderer.domElement.addEventListener("pointerleave", leave);
      const resize = () => {
        const w = host.clientWidth,
          h = host.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();
      const animate = () => {
        frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      api.current = {
        zoom: (amount) => {
          camera.position.multiplyScalar(amount);
          camera.position.clampLength(7, 22);
          controls.update();
        },
        reset: () => {
          position.current = null;
          camera.position.set(2, 12, 8);
          controls.target.set(0, 0.3, 0);
          controls.update();
        },
      };
      dispose = () => {
        position.current = camera.position.toArray();
        cancelAnimationFrame(frame);
        observer.disconnect();
        controls.dispose();
        renderer.domElement.removeEventListener("pointermove", move);
        renderer.domElement.removeEventListener("pointerdown", press);
        renderer.domElement.removeEventListener("pointerup", release);
        renderer.domElement.removeEventListener("pointerleave", leave);
        resources.forEach((r) => r.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        api.current = null;
      };
    }
    mount().catch(() => setFallback(true));
    return () => {
      cancelled = true;
      dispose();
    };
  }, [geo, metrics, selected, fallback, metric, reset]);
  const max = Math.max(...metrics.map((m) => m.value), 0.001);
  return (
    <div className="island-stage">
      <div className="island-top">
        <span>
          <i /> SRI LANKA / DISTRICT ATLAS
        </span>
        <b>{fallback ? "2D ACCESSIBLE VIEW" : "3D EXPLORER"}</b>
      </div>
      <div className="island-canvas" ref={container} />
      {!geo && !error && (
        <div className="island-loading">Preparing district geometry…</div>
      )}
      {error && (
        <div className="island-loading">
          <p>{error}</p>
          <p>Use the district list to explore the same data.</p>
        </div>
      )}
      {fallback && geo && (
        <svg
          className="island-flat"
          viewBox="-2.6 -4.2 5.3 8.4"
          role="img"
          aria-label="2D Sri Lanka district map"
        >
          {geo.features.map((f) => {
            const m = metrics.find((m) => m.id === f.properties.id);
            const polygons =
              f.geometry.type === "Polygon"
                ? [f.geometry.coordinates as number[][][]]
                : (f.geometry.coordinates as number[][][][]);
            return (
              <path
                key={f.properties.id}
                d={polygons
                  .flatMap((p) =>
                    p.map(
                      (r) =>
                        r
                          .map((pt, i) => {
                            const [x, y] = project(pt);
                            return `${i ? "L" : "M"}${x},${-y}`;
                          })
                          .join(" ") + "Z",
                    ),
                  )
                  .join(" ")}
                fill={
                  m?.name === selected
                    ? "#d2f99c"
                    : `hsl(150 30% ${22 + (metric === "renewable" ? (m?.renewableShare ?? 0) / 100 : (m?.value ?? 0) / max) * 38}%)`
                }
                fillRule="evenodd"
                stroke="#92ba9e"
                strokeWidth=".012"
                tabIndex={0}
                role="button"
                aria-label={f.properties.name}
                onClick={() => onSelect(f.properties.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(f.properties.name);
                  }
                }}
              >
                <title>
                  {f.properties.name}: {energy(m?.value ?? 0, unit)} {unit}
                </title>
              </path>
            );
          })}
        </svg>
      )}
      {hover && !fallback && (
        <div className="island-tooltip">
          <MapPinned size={14} />
          <b>{hover.name}</b>
          <span>
            {energy(hover.value, unit)} {unit} · {format(hover.share)}% of
            filtered total
          </span>
        </div>
      )}

      <div className="island-controls">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          onClick={() => api.current?.zoom(0.86)}
          disabled={fallback}
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          onClick={() => api.current?.zoom(1.16)}
          disabled={fallback}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reset map view"
          onClick={() => api.current?.reset()}
          disabled={fallback}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={fallback ? "Switch to 3D map" : "Switch to 2D map"}
          onClick={() => {
            position.current = null;
            setFallback((v) => !v);
            setReset((v) => v + 1);
          }}
        >
          {fallback ? <Move3D /> : <Layers />}
        </Button>
      </div>
      <div className="island-bottom">
        <span>
          {fallback
            ? "Select a district"
            : "Drag to orbit · Scroll to zoom · Click a district"}
        </span>
        <span>
          Height = consumption · Colour ={" "}
          {metric === "renewable" ? "renewable share" : "consumption"}
        </span>
      </div>
    </div>
  );
}
