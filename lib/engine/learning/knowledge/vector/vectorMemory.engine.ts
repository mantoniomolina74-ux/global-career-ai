/**

* ============================================================
* Global Career AI
* Knowledge Layer V1
* Vector Memory Engine (In-Memory Implementation)
* ---
* Temporary storage layer for vectorized knowledge entries.
*
* This implementation is NOT persistent.
* It will later be replaced by:
* * PostgreSQL + pgvector
* * Supabase vector store
* * Pinecone / Qdrant
*
* ============================================================
  */

import {
VectorRecord,
VectorSearchResult,
vectorTopKSearch,
} from "./vectorMemory.query";

import {
cosineSimilarity,
} from "./vectorMemory.similarity";

const memoryStore: Map<string, VectorRecord> = new Map();

export function upsertVectorRecord<T>(
id: string,
vector: number[],
payload: T
): void {
memoryStore.set(id, {
id,
vector,
payload,
});
}

export function deleteVectorRecord(id: string): void {
memoryStore.delete(id);
}

export function getVectorRecord<T>(id: string): VectorRecord<T> | null {
const record = memoryStore.get(id);

if (!record) return null;

return record as VectorRecord<T>;
}

export function getAllVectorRecords<T>(): VectorRecord<T>[] {
return Array.from(memoryStore.values()) as VectorRecord<T>[];
}

export function searchSimilarVectors<T>(
queryVector: number[],
topK: number = 5,
threshold: number = 0
): VectorSearchResult<T>[] {
const dataset = getAllVectorRecords<T>();

return vectorTopKSearch(queryVector, dataset, {
topK,
threshold,
});
}

export function findNearestVector<T>(
queryVector: number[]
): VectorSearchResult<T> | null {
const results = searchSimilarVectors<T>(queryVector, 1, 0);

return results.length > 0 ? results[0] : null;
}

export function clearVectorMemory(): void {
memoryStore.clear();
}

export function getVectorMemorySize(): number {
return memoryStore.size;
}

export function compareWithStoredVector(
id: string,
queryVector: number[]
): number | null {
const record = memoryStore.get(id);

if (!record) return null;

return cosineSimilarity(queryVector, record.vector);
}