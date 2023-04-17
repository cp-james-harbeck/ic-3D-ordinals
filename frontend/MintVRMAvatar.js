import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VRMLoader } from '@pixiv/three-vrm';
import { createOrdinal, sendOrdinal } from 'js-1sat-ord';

const MintVRMAvatar = () => {
  const [file, setFile] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    if (!file) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([new Uint8Array(reader.result)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const loader = new VRMLoader();
      loader.load(
        url,
        (vrm) => {
          scene.add(vrm.scene);
          camera.position.z = 2;
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the VRM avatar:', error);
        }
      );
    };
    reader.readAsArrayBuffer(file);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, [file]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file) {
      alert('Please select a VRM avatar file.');
      return;
    }

    // Read the file as base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];

      // Prepare the inscription data
      const inscription = {
        dataB64: base64Data,
        contentType: 'model/vrm',
      };

      // TODO: Provide the necessary parameters for creating the ordinal
      const tx = await createOrdinal(utxo, ordinalDestinationAddress, paymentPk, changeAddress, feeSats, inscription);

      // Send the ordinal to the Bitcoin SV blockchain
      await sendOrdinal(tx);

      alert('Ordinal created and sent successfully!');
    };
  };

  return (
    <div>
      <h1>Mint VRM Avatar</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleMint}>Mint</button>
      <div ref={containerRef}></div>
    </div>
  );
};

export default MintVRMAvatar;
