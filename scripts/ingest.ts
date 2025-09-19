import * as fs from "fs";
import "reflect-metadata";
import { SimpleRagService } from "./simple-rag.service";
import { ProductDoc } from "../src/shared/types/product.types";

async function loadEnvironmentVariables(): Promise<void> {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  } catch (error) {
    console.log('No .env file found, using system environment variables');
  }
}

async function main() {
  try {
    await loadEnvironmentVariables();
    
        const rag = new SimpleRagService();
    
    // Check if products.json exists
    if (!fs.existsSync("products.json")) {
      console.error("❌ products.json file not found!");
      console.log("Please create a products.json file with your product data.");
      process.exit(1);
    }
    
    const rows: ProductDoc[] = JSON.parse(fs.readFileSync("products.json", "utf8"));
    
    if (!Array.isArray(rows) || rows.length === 0) {
      console.error("❌ products.json must contain an array of products!");
      process.exit(1);
    }
    
    console.log(`📦 Starting to ingest ${rows.length} products...`);
    
    // Validate required fields
    for (let i = 0; i < rows.length; i++) {
      const product = rows[i];
      if (!product.id || !product.title || !product.description || product.price === undefined) {
        console.error(`❌ Product at index ${i} is missing required fields (id, title, description, price)`);
        process.exit(1);
      }
    }
    
    await rag.upsertProducts(rows);
    console.log(`✅ Successfully ingested ${rows.length} products!`);
    
    // Get collection info
    try {
      const info = await rag.getCollectionInfo();
      console.log(`📊 Collection info:`, {
        vectors_count: info.vectors_count,
        status: info.status
      });
    } catch (error) {
      console.log("⚠️  Could not get collection info");
    }
    
  } catch (error) {
    console.error("❌ Error during ingestion:", error);
    process.exit(1);
  }
}

main();
