import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge");
const INDEX_DIR = path.join(__dirname, "..", ".faiss-index");

function getEmbeddings() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is missing. Check server/.env loading.");
  }

  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
  });
}

function titleFromFileName(fileName) {
  return fileName
    .replace(/\.txt$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugFromFileName(fileName) {
  return fileName.replace(/\.txt$/i, "").toLowerCase();
}

function loadKnowledgeFiles() {
  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((name) => name.endsWith(".txt"))
    .sort();

  return files.map((fileName) => {
    const fullPath = path.join(KNOWLEDGE_DIR, fileName);
    const text = fs.readFileSync(fullPath, "utf8");

    return {
      fileName,
      sourceSlug: slugFromFileName(fileName),
      document: new Document({
        pageContent: text,
        metadata: {
          source: fileName,
          title: titleFromFileName(fileName),
        },
      }),
    };
  });
}

async function buildFreshIndex() {
  const loadedFiles = loadKnowledgeFiles();
  const embeddings = getEmbeddings();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 80,
  });

  const allDocs = [];

  for (const { fileName, sourceSlug, document } of loadedFiles) {
    const splitDocs = await splitter.splitDocuments([document]);

    splitDocs.forEach((doc, index) => {
      const sourceId = `${sourceSlug}-${String(index + 1).padStart(3, "0")}`;

      allDocs.push(
        new Document({
          pageContent: doc.pageContent,
          metadata: {
            ...doc.metadata,
            source: fileName,
            title: doc.metadata.title ?? titleFromFileName(fileName),
            sourceId,
            chunkIndex: index,
          },
        }),
      );
    });
  }

  const store = new FaissStore(embeddings, {});
  await store.addDocuments(allDocs);

  fs.mkdirSync(INDEX_DIR, { recursive: true });
  await store.save(INDEX_DIR);

  console.log(`Loaded ${loadedFiles.length} knowledge documents`);
  console.log(`Created ${allDocs.length} chunks`);
  console.log(`Saved vector store to ${INDEX_DIR}`);

  return store;
}

export async function getVectorStore() {
  const embeddings = getEmbeddings();

  const hasSavedIndex =
    fs.existsSync(INDEX_DIR) && fs.readdirSync(INDEX_DIR).length > 0;

  if (hasSavedIndex) {
    return FaissStore.load(INDEX_DIR, embeddings);
  }

  return buildFreshIndex();
}

export async function retrieveRelevantDocs(text, limit = 4) {
  const store = await getVectorStore();
  const docs = await store.similaritySearch(text, limit);

  return docs.map((doc) => ({
    sourceId: doc.metadata.sourceId ?? "unknown-source",
    source: doc.metadata.source ?? "unknown",
    title: doc.metadata.title,
    content: doc.pageContent,
  }));
}
