"use client";

import { DoubleSide } from "three";
import { fabricProps, type ChairStyle, type SetupFinish, type TableShape } from "@/lib/storefront/table-builder";

const TABLE_WOOD = "#c4a574";
const TABLE_LEG = "#7a5a3a";
const FLOOR = "#ebe3d4";

export function RoomFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[7, 64]} />
      <meshStandardMaterial color={FLOOR} roughness={0.9} />
    </mesh>
  );
}

export function TableMesh({ shape }: { shape: TableShape }) {
  if (shape === "round") {
    return (
      <group>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 1.15, 0.07, 48]} />
          <meshStandardMaterial color={TABLE_WOOD} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 0.64, 16]} />
          <meshStandardMaterial color={TABLE_LEG} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[0.45, 0.5, 0.08, 24]} />
          <meshStandardMaterial color={TABLE_LEG} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.07, 1.2]} />
        <meshStandardMaterial color={TABLE_WOOD} roughness={0.55} />
      </mesh>
      {[
        [-1.05, 0.36, -0.48],
        [1.05, 0.36, -0.48],
        [-1.05, 0.36, 0.48],
        [1.05, 0.36, 0.48],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshStandardMaterial color={TABLE_LEG} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function LinenMesh({
  shape,
  color,
  finish,
}: {
  shape: TableShape;
  color: string;
  finish: SetupFinish;
}) {
  const fabric = fabricProps(color, finish);

  if (shape === "round") {
    return (
      <group>
        <mesh position={[0, 0.765, 0]} receiveShadow>
          <cylinderGeometry args={[1.28, 1.28, 0.03, 48]} />
          <meshStandardMaterial {...fabric} />
        </mesh>
        <mesh position={[0, 0.58, 0]} receiveShadow>
          <cylinderGeometry args={[1.28, 1.28, 0.36, 48, 1, true]} />
          <meshStandardMaterial {...fabric} side={DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.765, 0]} receiveShadow>
        <boxGeometry args={[2.62, 0.03, 1.42]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[0, 0.58, 0.71]} receiveShadow>
        <boxGeometry args={[2.62, 0.36, 0.03]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[0, 0.58, -0.71]} receiveShadow>
        <boxGeometry args={[2.62, 0.36, 0.03]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[1.31, 0.58, 0]} receiveShadow>
        <boxGeometry args={[0.03, 0.36, 1.42]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[-1.31, 0.58, 0]} receiveShadow>
        <boxGeometry args={[0.03, 0.36, 1.42]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
    </group>
  );
}

export function OverlayMesh({
  shape,
  color,
  finish,
}: {
  shape: TableShape;
  color: string;
  finish: SetupFinish;
}) {
  const fabric = fabricProps(color, finish);

  if (shape === "round") {
    return (
      <mesh position={[0, 0.79, 0]} receiveShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.02, 48]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.79, 0]} receiveShadow>
      <boxGeometry args={[1.7, 0.02, 0.78]} />
      <meshStandardMaterial {...fabric} />
    </mesh>
  );
}

function FoldingChair({
  coverColor,
  coverFinish,
}: {
  coverColor: string | null;
  coverFinish: SetupFinish;
}) {
  const seatColor = coverColor ?? "#d8d4cc";
  const fabric = coverColor
    ? fabricProps(coverColor, coverFinish)
    : { color: seatColor, roughness: 0.7, metalness: 0.05 };
  const frame = "#8a8f98";

  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.42, 0.04, 0.42]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[0, 0.78, -0.18]} castShadow>
        <boxGeometry args={[0.42, 0.48, 0.05]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      {[
        [-0.16, 0.23, -0.16],
        [0.16, 0.23, -0.16],
        [-0.16, 0.23, 0.16],
        [0.16, 0.23, 0.16],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.04, 0.46, 0.04]} />
          <meshStandardMaterial color={frame} metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function TiffanyChair({
  coverColor,
  coverFinish,
}: {
  coverColor: string | null;
  coverFinish: SetupFinish;
}) {
  const fabric = coverColor
    ? fabricProps(coverColor, coverFinish)
    : { color: "#f4f0e6", roughness: 0.75, metalness: 0.04 };
  const gold = "#d4af37";

  return (
    <group>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
        <meshStandardMaterial {...fabric} />
      </mesh>
      <mesh position={[0, 0.86, -0.16]} rotation={[0.12, 0, 0]} castShadow>
        <torusGeometry args={[0.18, 0.025, 12, 32]} />
        <meshStandardMaterial color={gold} metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.7, -0.18]} castShadow>
        <boxGeometry args={[0.04, 0.36, 0.04]} />
        <meshStandardMaterial color={gold} metalness={0.65} roughness={0.25} />
      </mesh>
      {[
        [-0.14, 0.24, -0.14],
        [0.14, 0.24, -0.14],
        [-0.14, 0.24, 0.14],
        [0.14, 0.24, 0.14],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.48, 10]} />
          <meshStandardMaterial color={gold} metalness={0.65} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function chairPlacement(shape: TableShape, count: number, index: number) {
  if (shape === "round") {
    const angle = (index / count) * Math.PI * 2 + Math.PI / count;
    const radius = 1.85;
    return {
      position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius] as [
        number,
        number,
        number,
      ],
      rotation: [0, angle + Math.PI, 0] as [number, number, number],
    };
  }

  const longSide = Math.ceil(count / 2);
  const onFront = index < longSide;
  const sideIndex = onFront ? index : index - longSide;
  const sideCount = onFront ? longSide : count - longSide;
  const width = 2.1;
  const spacing = sideCount <= 1 ? 0 : width / (sideCount + 1);
  const x = -width / 2 + spacing * (sideIndex + 1);
  const z = onFront ? 1.15 : -1.15;

  return {
    position: [x, 0, z] as [number, number, number],
    rotation: [0, onFront ? Math.PI : 0, 0] as [number, number, number],
  };
}

export function ChairRing({
  shape,
  style,
  count,
  coverColor,
  coverFinish,
}: {
  shape: TableShape;
  style: ChairStyle;
  count: number;
  coverColor: string | null;
  coverFinish: SetupFinish;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const placement = chairPlacement(shape, count, index);
        return (
          <group
            key={index}
            position={placement.position}
            rotation={placement.rotation}
          >
            {style === "tiffany" ? (
              <TiffanyChair coverColor={coverColor} coverFinish={coverFinish} />
            ) : (
              <FoldingChair coverColor={coverColor} coverFinish={coverFinish} />
            )}
          </group>
        );
      })}
    </group>
  );
}
