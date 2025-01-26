import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";  // Utilisation de PapaParse pour lire le CSV
import * as THREE from "three"; // Importation de Three.js
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls" // Importation des contrôles de caméra

const Galaxy = () => {
  const [starsData, setStarsData] = useState([]); // Pour stocker les données des étoiles
  const canvasRef = useRef(null); // Référence au canvas pour afficher la scène 3D

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch("/data/hygdataV4.csv"); // Utiliser fetch pour récupérer le fichier CSV
        const textData = await response.text(); // Lire le fichier CSV en texte

        // Parser le fichier CSV avec papaparse
        Papa.parse(textData, {
          complete: (parsedData) => {
            // Extraire uniquement les colonnes x, y, z pour les étoiles
            const filteredData = parsedData.data.map(star => ({
              x: parseFloat(star.x) || Math.random() * 500 - 250,  // S'assurer que les valeurs sont numériques
              y: parseFloat(star.y) || Math.random() * 500 - 250,
              z: parseFloat(star.z) || Math.random() * 500 - 250,
            }));
            setStarsData(filteredData); // Afficher toutes les étoiles disponibles
          },
          header: true, // Utiliser la première ligne comme noms de colonnes
          delimiter: ";", // Spécifier que le délimiteur est un point-virgule
        });
      } catch (error) {
        console.error("Erreur lors de la lecture des données CSV :", error);
      }
    };

    fetchCSVData();  // Appel de la fonction pour récupérer et parser les données
  }, []);

  useEffect(() => {
    if (starsData.length > 0) {
      // Initialisation de la scène 3D avec three.js
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight); // Ajuster le canvas à la taille de la fenêtre
      document.body.appendChild(renderer.domElement);

      // Ajouter des étoiles à partir des données CSV
      const starGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Sphère de petite taille pour les étoiles
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Couleur blanche pour les étoiles

      // Ajouter des étoiles selon les données
      starsData.forEach((star) => {
        const starObj = new THREE.Mesh(starGeometry, starMaterial);
        
        // Positionner les étoiles en fonction des données x, y, z
        const x = star.x;
        const y = star.y;
        const z = star.z;

        starObj.position.set(x, y, z);
        scene.add(starObj);
      });

      // Ajouter une lumière ambiante
      const ambientLight = new THREE.AmbientLight(0x404040); // Lumière douce
      scene.add(ambientLight);

      // Ajouter une lumière directionnelle pour simuler un soleil
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 1).normalize();
      scene.add(directionalLight);

      // Positionner la caméra pour une vue dézoomée
      camera.position.set(0, 200, 500); // Placer la caméra plus loin pour un dézoom
      camera.lookAt(new THREE.Vector3(0, 0, 0)); // Regarder vers le centre de la galaxie

      // Ajouter les contrôles OrbitControls pour permettre le zoom et la rotation
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI / 2; // Limiter la caméra à se déplacer seulement autour de l'axe vertical

      // Gérer le redimensionnement de la fenêtre
      window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Mettre à jour les dimensions du renderer et du camera aspect ratio
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });

      // Animation de la scène
      const animate = () => {
        requestAnimationFrame(animate);

        // Mettre à jour les contrôles
        controls.update(); 

        renderer.render(scene, camera);
      };

      animate();
    }
  }, [starsData]);

  return <canvas ref={canvasRef}></canvas>; // Le canvas où sera affichée la galaxie
};

export default Galaxy;
