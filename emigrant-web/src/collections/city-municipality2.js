import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the JSON data
const jsonData = JSON.parse(
  readFileSync(join(__dirname, "cities-municipalities-data.json"), "utf-8")
);

// Function to upload cities and municipalities with custom IDs
async function uploadCitiesMunicipalities() {
  const cityMunicipalityCollection = collection(db, "city-municipality");
  const citiesMunicipalities = jsonData.citiesMunicipalities;

  console.log(`📊 Starting upload of ${citiesMunicipalities.length} cities and municipalities...`);

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const place of citiesMunicipalities) {
      try {
        const docRef = doc(cityMunicipalityCollection, place.id);
        await setDoc(docRef, {
          name: place.name,
          provinceId: place.provinceId,
          area: place.area,
          createdAt: new Date(),
        });
        successCount++;
        console.log(`✅ [${successCount}/${citiesMunicipalities.length}] Added: ${place.id} - ${place.name} (${place.area} sq km)`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error adding ${place.id}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Upload completed!");
    console.log(`✅ Successfully uploaded: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount}`);
    }
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Critical error during upload:", error);
  }
}

uploadCitiesMunicipalities();
// To run this script, use: node src/collections/city-municipality.js