import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PopOver from "./PopOver";

const Galaxy = () => {
  const [starsData, setStarsData] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch("/data/hygdataV4.csv");
        const textData = await response.text();

        Papa.parse(textData, {
          complete: (parsedData) => {
            const filteredData = parsedData.data.map((star) => ({
              name: star.proper || "Unnamed Star", // Nom de l'étoile
              spect: star.spect || "Unknown", // Type spectral
              mass: star.mass ? parseFloat(star.mass).toFixed(2) : "Unknown", // Masse (arrondi)
              radius: star.radius ? parseFloat(star.radius).toFixed(2) : "Unknown", // Rayon (arrondi)
              luminosity: star.lum ? parseFloat(star.lum).toFixed(2) : "Unknown", // Luminosité (arrondi)
              evolutionSustaining: star.var === "true", // Étoile variable ou non
              constellation: star.cons || "Unknown", // Constellation
              x: parseFloat(star.x) || 0,
              y: parseFloat(star.y) || 0,
              z: parseFloat(star.z) || 0,
            }));

            setStarsData(filteredData);
          },
          header: true,
          delimiter: ";",
        });
      } catch (error) {
        console.error("Erreur lors de la lecture des données CSV :", error);
      }
    };

    fetchCSVData();
  }, []);

  useEffect(() => {
    if (starsData.length > 0) {
      // Initialisation de la scène
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Ajout des étoiles
      const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stars = starsData.map((star) => {
        const starObj = new THREE.Mesh(starGeometry, starMaterial);
        starObj.position.set(star.x, star.y, star.z);
        starObj.userData = star; // Associe les données de l'étoile à l'objet
        scene.add(starObj);
        return starObj;
      });

      // Ajout des lumières
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 1).normalize();
      scene.add(directionalLight);

      // Positionnement initial de la caméra
      camera.position.set(0, 200, 500);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Configuration des contrôles
      const controls = new OrbitControls(camera, renderer.domElement);

      // Raycaster et souris
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        setMousePosition({ x: event.clientX, y: event.clientY });
      };

      window.addEventListener("mousemove", onMouseMove);

      // Animation de la scène
      const animate = () => {
        requestAnimationFrame(animate);

        // Détection des intersections avec la souris
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(stars);

        if (intersects.length > 0) {
          const hoveredStar = intersects[0].object.userData;
          setHoveredStar(hoveredStar); // Mets à jour l'étoile survolée
        } else {
          setHoveredStar(null); // Pas d'interaction
        }

        controls.update();
        renderer.render(scene, camera); // Rendu de la scène
      };

      animate(); // Appel initial de la fonction d'animation

      // Gestion du redimensionnement de la fenêtre
      window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
    }
  }, [starsData]);

  return (
      <>
        <canvas ref={canvasRef}></canvas>
        <PopOver
            data={hoveredStar}
            position={mousePosition}
            isVisible={hoveredStar !== null}
        />
      </>
  );
};

export default Galaxy;