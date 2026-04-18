import { getVectorStore } from "./vectorStore.js";

async function main() {
  await getVectorStore();
  console.log("✅ AI Review vector store is ready");
}

main().catch((err) => {
  console.error("❌ Failed to build AI Review vector store:", err);
  process.exit(1);
});
