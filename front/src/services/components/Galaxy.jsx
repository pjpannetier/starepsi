import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PopOver from "./PopOver";

const Galaxy = () => {
  const [starsData, setStarsData] = useState([]);
  const [filteredStars, setFilteredStars] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Charger les données CSV
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch("/data/hygdataV4.csv");
        const textData = await response.text();

        Papa.parse(textData, {
          complete: (parsedData) => {
            const parsedStars = parsedData.data
                .map((star) => ({
                  name: star.proper || "Unnamed Star",
                  spect: star.spect || "Unknown",
                  mass: star.mass ? parseFloat(star.mass).toFixed(2) : "Unknown",
                  radius: star.radius ? parseFloat(star.radius).toFixed(2) : "Unknown",
                  luminosity: star.lum ? parseFloat(star.lum).toFixed(2) : "Unknown",
                  evolutionSustaining: star.var === "true",
                  constellation: star.cons || "Unknown",
                  x: parseFloat(star.x) || 0,
                  y: parseFloat(star.y) || 0,
                  z: parseFloat(star.z) || 0,
                }))
                .filter((star) => !isNaN(star.x) && !isNaN(star.y) && !isNaN(star.z)); // Éliminer les entrées invalides
            setStarsData(parsedStars);
            setFilteredStars(parsedStars); // Afficher toutes les étoiles par défaut
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

  // Filtrer les étoiles en fonction du filtre
  const filterStars = (filterType) => {
    if (filterType === "closest") {
      const sortedStars = [...starsData].sort((a, b) => {
        const distanceA = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
        const distanceB = Math.sqrt(b.x ** 2 + b.y ** 2 + b.z ** 2);
        return distanceA - distanceB;
      });
      setFilteredStars(sortedStars.slice(0, 50)); // Les 50 étoiles les plus proches
    } else {
      setFilteredStars(starsData); // Toutes les étoiles
    }
  };

  // Afficher les étoiles dans la scène
  useEffect(() => {
    if (filteredStars.length > 0) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const stars = filteredStars.map((star) => {
        const starObj = new THREE.Mesh(starGeometry, starMaterial);
        starObj.position.set(star.x, star.y, star.z);
        starObj.userData = star;
        scene.add(starObj);
        return starObj;
      });

      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 1).normalize();
      scene.add(directionalLight);

      camera.position.set(0, 200, 500);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const controls = new OrbitControls(camera, renderer.domElement);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        setMousePosition({ x: event.clientX, y: event.clientY });
      };

      window.addEventListener("mousemove", onMouseMove);

      const animate = () => {
        requestAnimationFrame(animate);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(stars);

        if (intersects.length > 0) {
          const hoveredStar = intersects[0].object.userData;
          setHoveredStar(hoveredStar);
        } else {
          setHoveredStar(null);
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
    }
  }, [filteredStars]);

  const buttonStyle = {
    display: "block",
    marginBottom: "10px",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#4CAF50",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "center",
  };

  return (
      <>
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
          <button style={buttonStyle} onClick={() => filterStars("all")}>
            Toutes les étoiles
          </button>
          <button style={buttonStyle} onClick={() => filterStars("closest")}>
            50 étoiles les plus proches
          </button>
        </div>
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
