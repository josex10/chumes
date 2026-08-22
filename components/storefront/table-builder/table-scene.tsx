"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import {
  ChairRing,
  LinenMesh,
  OverlayMesh,
  RoomFloor,
  TableMesh,
} from "@/components/storefront/table-builder/table-meshes";
import {
  findOption,
  SETUP_SLOT,
  type LinkedSetupOption,
  type TableBuilderSelection,
} from "@/lib/storefront/table-builder";

type TableSceneProps = {
  selection: TableBuilderSelection;
  options: LinkedSetupOption[];
};

export function TableScene({ selection, options }: TableSceneProps) {
  const linen = findOption(options, SETUP_SLOT.LINEN, selection.linen);
  const overlay =
    selection.overlay === "none"
      ? undefined
      : findOption(options, SETUP_SLOT.OVERLAY, selection.overlay);
  const cover =
    selection.cover === "none"
      ? undefined
      : findOption(options, SETUP_SLOT.COVER, selection.cover);

  return (
    <Canvas
      shadows
      camera={{ position: [4.2, 3.1, 4.2], fov: 38 }}
      className="h-full w-full"
    >
      <color attach="background" args={["#f3eee4"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff8ee", "#cbbba0", 0.45]} />
      <directionalLight
        position={[4.5, 7, 3]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <RoomFloor />
      <TableMesh shape={selection.table} />
      {linen ? (
        <LinenMesh
          shape={selection.table}
          color={linen.previewColor}
          finish={linen.finish}
        />
      ) : null}
      {overlay ? (
        <OverlayMesh
          shape={selection.table}
          color={overlay.previewColor}
          finish={overlay.finish}
        />
      ) : null}
      <ChairRing
        shape={selection.table}
        style={selection.chair}
        count={selection.chairCount}
        coverColor={cover?.previewColor ?? null}
        coverFinish={cover?.finish ?? "matte"}
      />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.35}
        scale={8}
        blur={2.2}
        far={4}
      />
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={8}
        minPolarAngle={0.4}
        maxPolarAngle={1.25}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
