import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PopOver from "./PopOver";

const Galaxy = () => {
    const [starsData, setStarsData] = useState([]);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [filter, setFilter] = useState("all"); // État par défaut pour afficher tous les objets célestes
    const canvasRef = useRef(null);

    // Fonction pour obtenir la couleur basée sur le type spectral
    const getColorFromSpectralType = (spectralType) => {
        const colors = {
            O: "#5A5AFF", // Bleu foncé
            B: "#5AC8FA", // Bleu clair
            A: "#FFFFFF", // Blanc pur
            F: "#FFFFAA", // Blanc-jaune
            G: "#FFD700", // Jaune
            K: "#FFA500", // Orange
            M: "#FF4500", // Rouge
        };
        return colors[spectralType?.charAt(0)] || "#FFFFFF"; // Couleur par défaut (blanc)
    };

    useEffect(() => {
        const fetchCSVData = async () => {
            try {
                const response = await fetch("/data/hygdataV4.csv");
                const textData = await response.text();

                Papa.parse(textData, {
                    complete: (parsedData) => {
                        let filteredData = parsedData.data;

                        if (filter === "all") {
                            // Afficher tous les objets célestes
                            filteredData = parsedData.data; // Pas de filtre
                        } else if (filter === "nearest") {
                            // 50 étoiles les plus proches
                            filteredData = filteredData
                                .filter((star) => parseFloat(star.mag) <= 6) // Étoiles visibles
                                .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist)) // Tri par distance
                                .slice(0, 50);
                        } else if (filter === "brightest") {
                            // 50 objets célestes les plus brillants
                            filteredData = filteredData
                                .filter((star) => parseFloat(star.mag) <= 6) // Étoiles visibles
                                .sort((a, b) => parseFloat(a.mag) - parseFloat(b.mag)) // Tri par magnitude
                                .slice(0, 50);
                        } else if (filter === "hottest") {
                            // 50 objets célestes les plus chauds
                            const spectralOrder = ["O", "B", "A", "F", "G", "K", "M"];
                            filteredData = filteredData
                                .filter((star) => spectralOrder.includes(star.spect?.charAt(0))) // Types spectraux connus
                                .sort(
                                    (a, b) =>
                                        spectralOrder.indexOf(a.spect?.charAt(0)) -
                                        spectralOrder.indexOf(b.spect?.charAt(0))
                                )
                                .slice(0, 50);
                        }

                        const mappedData = filteredData.map((star) => ({
                            name: star.proper || "Unnamed Star",
                            spect: star.spect || "Unknown",
                            dist: parseFloat(star.dist) || "Unknown",
                            mag: parseFloat(star.mag) || "Unknown",
                            radius: parseFloat(star.radius) || 1,
                            x: parseFloat(star.x) || 0,
                            y: parseFloat(star.y) || 0,
                            z: parseFloat(star.z) || 0,
                        }));

                        setStarsData(mappedData);
                    },
                    header: true,
                    delimiter: ";",
                });
            } catch (error) {
                console.error("Erreur lors de la lecture des données CSV :", error);
            }
        };

        fetchCSVData();
    }, [filter]);

    useEffect(() => {
        if (starsData.length > 0) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
            renderer.setSize(window.innerWidth, window.innerHeight);

            const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);

            const stars = starsData.map((star) => {
                const color = getColorFromSpectralType(star.spect);
                const starMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
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
    }, [starsData]);

    return (
        <div>
            <div style={{ padding: "20px", backgroundColor: "#333", color: "#fff", display: "flex", gap: "10px" }}>
                <button
                    style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: filter === "all" ? "#777" : "#555",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setFilter("all")}
                >
                    Tous les objets célestes
                </button>
                <button
                    style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: filter === "nearest" ? "#777" : "#555",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setFilter("nearest")}
                >
                    50 Étoiles les plus proches
                </button>
                <button
                    style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: filter === "brightest" ? "#FFD700" : "#555",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setFilter("brightest")}
                >
                    Objets célestes les plus brillants
                </button>
                <button
                    style={{
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: filter === "hottest" ? "#FF4500" : "#555",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setFilter("hottest")}
                >
                    Objets célestes les plus chauds
                </button>
            </div>

            <canvas ref={canvasRef}></canvas>

            <PopOver
                data={hoveredStar}
                position={mousePosition}
                isVisible={hoveredStar !== null}
            />
        </div>
    );
};

export default Galaxy;
