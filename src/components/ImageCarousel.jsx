import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import {
  abs,
  add,
  div,
  length,
  max,
  mix,
  mul,
  positionLocal,
  smoothstep,
  sub,
  texture,
  uv,
  vec4,
} from "three/tsl";
import { NodeMaterial } from "three/webgpu";

export const ImageCarousel = ({
  images = [],
  radius = 5,
  imageWidth = 3,
  imageHeight = 4,
  cornerRadius = 0.15,
  bendAmount = 0.3,
  centerOpacity = 1.0,
  adjacentOpacity = 0.7,
  farOpacity = 0.3,
  friction = 0.95,
  wheelSensitivity = 0.002,
  dragSensitivity = 0.005,
  enableSnapping = true,
}) => {
  const groupRef = useRef();
  const { gl } = useThree();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth rotation state
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const targetRotationRef = useRef(0);
  const isSnapping = useRef(false);

  const textures = useLoader(TextureLoader, images, (loader) => {
    loader.crossOrigin = "anonymous";
  });

  // Set correct colorSpace for all textures
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  // Mouse wheel handler
  const handleWheel = (event) => {
    event.preventDefault();
    // Apply wheel sensitivity properly scaled
    const wheelForce = event.deltaY * wheelSensitivity * 0.01;
    velocityRef.current += wheelForce;
    isSnapping.current = false; // Stop snapping when user interacts
  };

  // Mouse drag handlers
  const handleMouseDown = (event) => {
    isDragging.current = true;
    lastMouseX.current = event.clientX;
    gl.domElement.style.cursor = "grabbing";
  };

  const handleMouseMove = (event) => {
    if (!isDragging.current) return;

    const deltaX = event.clientX - lastMouseX.current;
    // Apply drag sensitivity properly scaled
    const dragForce = deltaX * dragSensitivity * 0.01;
    velocityRef.current += dragForce;
    lastMouseX.current = event.clientX;
    isSnapping.current = false; // Stop snapping when user drags
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    gl.domElement.style.cursor = "grab";
  };

  // Touch handlers for mobile
  const handleTouchStart = (event) => {
    isDragging.current = true;
    lastMouseX.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event) => {
    if (!isDragging.current) return;

    const deltaX = event.touches[0].clientX - lastMouseX.current;
    // Apply drag sensitivity properly scaled
    const dragForce = deltaX * dragSensitivity * 0.01;
    velocityRef.current += dragForce;
    lastMouseX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Event listeners setup
  useEffect(() => {
    const canvas = gl.domElement;

    canvas.style.cursor = "grab";
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    // Touch events
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl.domElement]);

  // Smooth animation with friction and snapping
  useFrame((state, delta) => {
    if (groupRef.current) {
      const velocityThreshold = 0.002;

      // Apply friction using delta time for frame-rate independence
      const frictionFactor = Math.pow(friction, delta * 60); // Normalize to 60fps
      velocityRef.current *= frictionFactor;

      // Check if we should start snapping
      if (
        enableSnapping &&
        !isDragging.current &&
        !isSnapping.current &&
        Math.abs(velocityRef.current) < velocityThreshold
      ) {
        // Calculate which image we're closest to
        const anglePerImage = (Math.PI * 2) / images.length;
        const currentRotation = rotationRef.current;

        // Simple and reliable snapping logic
        const currentAngle = -currentRotation; // Convert back to positive angle
        const normalizedAngle =
          ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // Find which image we're closest to
        const imageFloat = normalizedAngle / anglePerImage;
        const nearestImageIndex = Math.round(imageFloat) % images.length;

        // Calculate target rotation (keeping it negative as expected)
        const targetRotation = -(nearestImageIndex * anglePerImage);

        // Adjust target to be close to current rotation (avoid long rotations)
        let bestTargetRotation = targetRotation;
        const diff1 = Math.abs(targetRotation - currentRotation);
        const diff2 = Math.abs(targetRotation + Math.PI * 2 - currentRotation);
        const diff3 = Math.abs(targetRotation - Math.PI * 2 - currentRotation);

        if (diff2 < diff1 && diff2 < diff3) {
          bestTargetRotation = targetRotation + Math.PI * 2;
        } else if (diff3 < diff1 && diff3 < diff2) {
          bestTargetRotation = targetRotation - Math.PI * 2;
        }

        targetRotationRef.current = bestTargetRotation;
        isSnapping.current = true;
        velocityRef.current = 0;
      }

      // Handle snapping animation
      if (isSnapping.current) {
        let diff = targetRotationRef.current - rotationRef.current;

        // Handle wraparound - choose shortest path
        if (Math.abs(diff) > Math.PI) {
          if (diff > 0) {
            diff -= Math.PI * 2;
          } else {
            diff += Math.PI * 2;
          }
        }

        const snapSpeed = 0.15;

        if (Math.abs(diff) < 0.005) {
          rotationRef.current = targetRotationRef.current;
          isSnapping.current = false;
        } else {
          rotationRef.current += diff * snapSpeed;
        }
      } else {
        // Update rotation normally with delta time
        rotationRef.current += velocityRef.current * delta * 60; // Normalize to 60fps
      }

      // Apply smooth rotation to the group
      groupRef.current.rotation.y = rotationRef.current;

      // Update current index based on rotation
      const anglePerImage = (Math.PI * 2) / images.length;
      const currentAngle = -rotationRef.current;
      const normalizedAngle =
        ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const newIndex =
        Math.round(normalizedAngle / anglePerImage) % images.length;

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  });

  // Removed click-to-change functionality

  const ImagePlane = ({ texture: imageTexture, index, total }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const angle = (index * Math.PI * 2) / total;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    // Calculate image position relative to current center
    const getImagePosition = () => {
      const totalImages = images.length;
      let distance = Math.abs(index - currentIndex);

      // Handle wraparound (e.g., if we have 6 images, image 0 and 5 are adjacent)
      if (distance > totalImages / 2) {
        distance = totalImages - distance;
      }

      return distance;
    };

    const getOpacity = () => {
      const position = getImagePosition();
      if (position === 0) return centerOpacity; // Center image
      if (position === 1) return adjacentOpacity; // Adjacent images
      return farOpacity; // Far images
    };

    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.lookAt(0, meshRef.current.position.y, 0);
      }
    });

    // Create TSL material with rounded corners and cylindrical bending
    const roundedCornersMaterial = useMemo(() => {
      const material = new NodeMaterial();

      // Individual plane cylindrical bending
      const position = positionLocal;

      // Bend each plane individually to look curved
      // The bend should curve the plane inward toward the carousel center (like a cylinder segment)
      const bendStrength = mul(bendAmount, 2.0); // More pronounced curvature
      const normalizedX = div(position.x, imageWidth * 0.5); // Normalize to half-width for better curve
      const curvature = mul(mul(normalizedX, normalizedX), bendStrength);
      const bentZ = add(position.z, curvature); // Changed from sub to add for inward curve

      material.positionNode = vec4(position.x, position.y, bentZ, position.w);

      const uvCoords = uv();
      const imageColor = texture(imageTexture, uvCoords);

      // Calculate distance from center for rounded rectangle
      const center = sub(uvCoords, 0.5);
      const d = length(max(sub(abs(center), 0.5 - cornerRadius), 0.0));

      // Create smooth mask for rounded corners
      const mask = smoothstep(cornerRadius + 0.01, cornerRadius - 0.01, d);

      // Mix transparent and image color based on mask
      const finalColor = mix(vec4(0, 0, 0, 0), imageColor, mask);

      material.colorNode = finalColor;
      material.transparent = true;
      material.side = THREE.DoubleSide;

      return material;
    }, [imageTexture, cornerRadius, radius, bendAmount, imageWidth]);

    // Update opacity based on position
    roundedCornersMaterial.opacity = getOpacity();

    return (
      <mesh
        ref={meshRef}
        position={[x, 0, z]}
        material={roundedCornersMaterial}
      >
        <planeGeometry args={[imageWidth, imageHeight, 32, 32]} />
      </mesh>
    );
  };

  if (!images.length) return null;

  return (
    <group ref={groupRef}>
      {images.map((image, index) => (
        <ImagePlane
          key={`${image}-${index}`}
          texture={textures[index]}
          index={index}
          total={images.length}
        />
      ))}

      {/* Center light */}
      <pointLight position={[0, 2, 0]} intensity={0.5} />
      <ambientLight intensity={0.3} />
    </group>
  );
};
