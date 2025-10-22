import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// For ES modules, __dirname workaround:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(
    join(__dirname, "../../filipinoemigrantsdb-9cc1e-firebase-adminsdk-fbsvc-3a27b36bed.json"),
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Define provinces with fixed IDs (based on your provided list)
const provinces = [
  { id: "ILN", name: "Ilocos Norte" },
  { id: "ILS", name: "Ilocos Sur" },
  { id: "LUN", name: "La Union" },
  { id: "PAN", name: "Pangasinan" },
  { id: "BTN", name: "Batanes" },
  { id: "CAG", name: "Cagayan" },
  { id: "ISA", name: "Isabela" },
  { id: "NUV", name: "Nueva Vizcaya" },
  { id: "QUI", name: "Quirino" },
  { id: "BAN", name: "Bataan" },
  { id: "BUL", name: "Bulacan" },
  { id: "NUE", name: "Nueva Ecija" },
  { id: "PAM", name: "Pampanga" },
  { id: "TAR", name: "Tarlac" },
  { id: "ZMB", name: "Zambales" },
  { id: "BTG", name: "Batangas" },
  { id: "CAV", name: "Cavite" },
  { id: "LAG", name: "Laguna" },
  { id: "MAR", name: "Marinduque" },
  { id: "OCC", name: "Occidental Mindoro" },
  { id: "ORI", name: "Oriental Mindoro" },
  { id: "PLW", name: "Palawan" },
  { id: "QUE", name: "Quezon" },
  { id: "RIZ", name: "Rizal" },
  { id: "ROM", name: "Romblon" },
  { id: "AUR", name: "Aurora" },
  { id: "ALB", name: "Albay" },
  { id: "CAN", name: "Camarines Norte" },
  { id: "CAS", name: "Camarines Sur" },
  { id: "CAT", name: "Catanduanes" },
  { id: "MASB", name: "Masbate" },
  { id: "SOR", name: "Sorsogon" },
  { id: "AKL", name: "Aklan" },
  { id: "ANT", name: "Antique" },
  { id: "CAP", name: "Capiz" },
  { id: "ILI", name: "Iloilo" },
  { id: "NEC", name: "Negros Occidental" },
  { id: "GUI", name: "Guimaras" },
  { id: "BOH", name: "Bohol" },
  { id: "CEB", name: "Cebu" },
  { id: "NER", name: "Negros Oriental" },
  { id: "SIQ", name: "Siquijor" },
  { id: "EAS", name: "Eastern Samar" },
  { id: "LEY", name: "Leyte" },
  { id: "NSA", name: "Northern Samar" },
  { id: "WSA", name: "Western Samar" },
  { id: "SLE", name: "Southern Leyte" },
  { id: "BIL", name: "Biliran" },
  { id: "BAS", name: "Basilan" },
  { id: "ZAN", name: "Zamboanga del Norte" },
  { id: "ZAS", name: "Zamboanga del Sur" },
  { id: "ZSI", name: "Zamboanga Sibugay" },
  { id: "BUK", name: "Bukidnon" },
  { id: "CAM", name: "Camiguin" },
  { id: "MSC", name: "Misamis Occidental" },
  { id: "MSO", name: "Misamis Oriental" },
  { id: "DAN", name: "Davao del Norte" },
  { id: "DAS", name: "Davao del Sur" },
  { id: "DAO", name: "Davao Oriental" },
  { id: "SCO", name: "South Cotabato" },
  { id: "SAR", name: "Sarangani" },
  { id: "COM", name: "Compostela Valley" },
  { id: "LAN", name: "Lanao Del Norte" },
  { id: "NCO", name: "North Cotabato" },
  { id: "COC", name: "Cotabato City" },
  { id: "SUK", name: "Sultan Kudarat" },
  { id: "AGN", name: "Agusan del Norte" },
  { id: "AGS", name: "Agusan del Sur" },
  { id: "SUN", name: "Surigao del Norte" },
  { id: "SUR", name: "Surigao del Sur" },
  { id: "LAS", name: "Lanao del Sur" },
  { id: "MAG", name: "Maguindanao" },
  { id: "SLU", name: "Sulu" },
  { id: "TAW", name: "Tawi-Tawi" },
  { id: "ABR", name: "Abra" },
  { id: "BEN", name: "Benguet" },
  { id: "IFU", name: "Ifugao" },
  { id: "KAL", name: "Kalinga" },
  { id: "MOU", name: "Mountain Province" },
  { id: "APA", name: "Apayao" },
  { id: "NCR", name: "National Capital Region" },
];

// Function to upload provinces with custom IDs
async function uploadProvinces() {
  const provinceCollection = db.collection("province");

  try {
    for (const province of provinces) {
      const docRef = provinceCollection.doc(province.id);
      await docRef.set({
        name: province.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Added: ${province.id} - ${province.name}`);
    }
    console.log("🎉 All provinces uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading provinces:", error);
  }
}

uploadProvinces();
// To run this script, use: node src/collections/province.js
