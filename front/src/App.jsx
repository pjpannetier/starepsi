import React, { useEffect, useState } from "react";
import { fetchData } from "./services/api/fetchData";

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCSVData = async () => {
      if (!data) { 
        try {
          const result = await fetchData("/data/hygdataV4.csv");
          setData(result); 
          console.log("Données CSV chargées :", result);
        } catch (error) {
          console.error("Erreur lors de la lecture des données CSV :", error);
        }
      }
    };

    fetchCSVData();
  }, [data]);

  return (
    <div>
      <h1>Lecture de fichier CSV</h1>
      {data ? (
        <p>Données chargées ! (Vérifiez la console)</p>
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
  );
};

export default App;
