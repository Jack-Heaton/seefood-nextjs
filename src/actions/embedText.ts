"use server";

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { S3VectorsClient, PutVectorsCommand } from "@aws-sdk/client-s3vectors"; // ES Modules import

import { wikitext } from "./wikitext";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

const s3VectorsClient = new S3VectorsClient({
  region: "us-east-2",
});

export async function embedText() {
  const chunks = wikitext
    .split(" ")
    .reduce((acc, curr, i) => {
      const chunkIndex = Math.floor(i / 100);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(curr);
      return acc;
    }, [] as string[][])
    .map((chunk) => chunk.join(" "));

  const embeddings = [];

  for (const chunk of chunks) {
    const embedResponse = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "amazon.titan-embed-text-v2:0",
        body: new TextEncoder().encode(
          JSON.stringify({
            inputText: chunk,
          })
        ),
      })
    );

    embeddings.push(
      JSON.parse(new TextDecoder().decode(embedResponse.body)).embedding
    );
  }

  const indexResponse = await s3VectorsClient.send(
    new PutVectorsCommand({
      vectorBucketName: process.env.VECTOR_BUCKET,
      indexName: process.env.TEXT_INDEX_NAME,

      vectors: embeddings.map((embedding, index) => ({
        data: {
          float32: embedding,
        },
        key: `wikitext-${index}`,
      })),
    })
  );

  console.log(indexResponse);
}
