import Papa from "papaparse";

export const fetchData = async (filePath) => {
  try {
    const response = await fetch(filePath); 
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true, 
        skipEmptyLines: true, 
        complete: (result) => resolve(result.data),
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Erreur lors de la lecture du CSV :", error);
    throw error;
  }
};
