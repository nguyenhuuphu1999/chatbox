#!/bin/bash

# Fix logger calls throughout the codebase
echo "Fixing logger calls..."

# Fix RagService logger calls
sed -i 's/this\.logger\.debug({ correlationId }, "Generating embedding for product", { productId: doc\.id });/this.logger.debug("Generating embedding for product", { correlationId, productId: doc.id });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Upserting points to Qdrant", { points_count: points\.length });/this.logger.debug("Upserting points to Qdrant", { correlationId, points_count: points.length });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG upsert products done", { docs_count: docs\.length });/this.logger.info("RAG upsert products done", { correlationId, docs_count: docs.length });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error RAG upsert products", error);/this.logger.error("Error RAG upsert products", { correlationId, error });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG search start", {/this.logger.info("RAG search start", { correlationId,/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Generating query embedding");/this.logger.debug("Generating query embedding", { correlationId });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Searching in Qdrant", { hasFilter: !!filter });/this.logger.debug("Searching in Qdrant", { correlationId, hasFilter: !!filter });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG search done", { results_count: results\.length });/this.logger.info("RAG search done", { correlationId, results_count: results.length });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error RAG search", error);/this.logger.error("Error RAG search", { correlationId, error });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG get collection info start");/this.logger.info("RAG get collection info start", { correlationId });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG get collection info done");/this.logger.info("RAG get collection info done", { correlationId });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error RAG get collection info", error);/this.logger.error("Error RAG get collection info", { correlationId, error });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG delete collection start");/this.logger.info("RAG delete collection start", { correlationId });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "RAG delete collection done");/this.logger.info("RAG delete collection done", { correlationId });/g' src/rag/rag.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error RAG delete collection", error);/this.logger.error("Error RAG delete collection", { correlationId, error });/g' src/rag/rag.service.ts

# Fix GeminiService logger calls
sed -i 's/this\.logger\.debug({ correlationId }, "Format products start", { items_count: items\.length });/this.logger.debug("Format products start", { correlationId, items_count: items.length });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Format products done", { result_length: result\.length });/this.logger.debug("Format products done", { correlationId, result_length: result.length });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini answer start", {/this.logger.info("Gemini answer start", { correlationId,/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Calling Gemini chat API");/this.logger.debug("Calling Gemini chat API", { correlationId });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini answer done", { result_length: result\.length });/this.logger.info("Gemini answer done", { correlationId, result_length: result.length });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error Gemini answer", error);/this.logger.error("Error Gemini answer", { correlationId, error });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini describe image start", {/this.logger.info("Gemini describe image start", { correlationId,/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Calling Gemini vision API");/this.logger.debug("Calling Gemini vision API", { correlationId });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini describe image done", { result_length: result\.length });/this.logger.info("Gemini describe image done", { correlationId, result_length: result.length });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error Gemini describe image", error);/this.logger.error("Error Gemini describe image", { correlationId, error });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini generate query start", {/this.logger.info("Gemini generate query start", { correlationId,/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.debug({ correlationId }, "Calling Gemini chat API for query generation");/this.logger.debug("Calling Gemini chat API for query generation", { correlationId });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Gemini generate query done", { result_length: result\.length });/this.logger.info("Gemini generate query done", { correlationId, result_length: result.length });/g' src/ai/gemini.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error Gemini generate query", error);/this.logger.error("Error Gemini generate query", { correlationId, error });/g' src/ai/gemini.service.ts

# Fix CreateProductService logger calls
sed -i 's/this\.logger\.info({ correlationId }, "Create products start", { count: body\.items\.length });/this.logger.info("Create products start", { correlationId, count: body.items.length });/g' src/services/products/create-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Duplicate product IDs found");/this.logger.error("Duplicate product IDs found", { correlationId });/g' src/services/products/create-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Products already exist", { existingIds });/this.logger.error("Products already exist", { correlationId, existingIds });/g' src/services/products/create-product.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Create products done", {/this.logger.info("Create products done", { correlationId,/g' src/services/products/create-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error create products", error);/this.logger.error("Error create products", { correlationId, error });/g' src/services/products/create-product.service.ts

# Fix GetProductService logger calls
sed -i 's/this\.logger\.info({ correlationId }, "Get product start", { productId: param\.id });/this.logger.info("Get product start", { correlationId, productId: param.id });/g' src/services/products/get-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Product not found", { productId: param\.id });/this.logger.error("Product not found", { correlationId, productId: param.id });/g' src/services/products/get-product.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Get product done", { productId: param\.id });/this.logger.info("Get product done", { correlationId, productId: param.id });/g' src/services/products/get-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error get product", error);/this.logger.error("Error get product", { correlationId, error });/g' src/services/products/get-product.service.ts

# Fix GetProductsService logger calls
sed -i 's/this\.logger\.info({ correlationId }, "Get products start", { query });/this.logger.info("Get products start", { correlationId, query });/g' src/services/products/get-products.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Get products done", {/this.logger.info("Get products done", { correlationId,/g' src/services/products/get-products.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error get products", error);/this.logger.error("Error get products", { correlationId, error });/g' src/services/products/get-products.service.ts

# Fix UpdateProductService logger calls
sed -i 's/this\.logger\.info({ correlationId }, "Update product start", { productId: body\.id });/this.logger.info("Update product start", { correlationId, productId: body.id });/g' src/services/products/update-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Product not found", { productId: body\.id });/this.logger.error("Product not found", { correlationId, productId: body.id });/g' src/services/products/update-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Product title duplicate", { title: body\.title });/this.logger.error("Product title duplicate", { correlationId, title: body.title });/g' src/services/products/update-product.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Update product done", { productId: body\.id });/this.logger.info("Update product done", { correlationId, productId: body.id });/g' src/services/products/update-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error update product", error);/this.logger.error("Error update product", { correlationId, error });/g' src/services/products/update-product.service.ts

# Fix DeleteProductService logger calls
sed -i 's/this\.logger\.info({ correlationId }, "Delete product start", { productId: body\.id });/this.logger.info("Delete product start", { correlationId, productId: body.id });/g' src/services/products/delete-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Product not found", { productId: body\.id });/this.logger.error("Product not found", { correlationId, productId: body.id });/g' src/services/products/delete-product.service.ts
sed -i 's/this\.logger\.info({ correlationId }, "Delete product done", { productId: body\.id });/this.logger.info("Delete product done", { correlationId, productId: body.id });/g' src/services/products/delete-product.service.ts
sed -i 's/this\.logger\.error({ correlationId }, "Error delete product", error);/this.logger.error("Error delete product", { correlationId, error });/g' src/services/products/delete-product.service.ts

# Fix other issues
sed -i 's/systemCode = SYSTEM_CODE\.SOMETHING_WENT_WRONG;/systemCode = SYSTEM_CODE.INTERNAL_SERVER_ERROR;/g' src/filters/error.http.filter.ts
sed -i 's/return document\.save();/return document.save() as Promise<TDoc>;/g' src/repositories/base-mongoose.repository.ts
sed -i 's/id: existingProduct\._id,/id: existingProduct._id!,/g' src/services/products/delete-product.service.ts

echo "Logger calls fixed!"
