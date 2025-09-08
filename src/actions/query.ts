"use server";

import {
  S3VectorsClient,
  QueryVectorsCommand,
} from "@aws-sdk/client-s3vectors";
import { embed } from "./embed";

const s3VectorsClient = new S3VectorsClient({
  region: "us-east-2",
});

export async function query(term: string) {
  const queryVector = await embed(term);

  const response = await s3VectorsClient.send(
    new QueryVectorsCommand({
      vectorBucketName: process.env.VECTOR_BUCKET,
      indexName: process.env.INDEX_NAME,
      topK: 10,
      queryVector: {
        float32: queryVector.embedding,
      },
      returnDistance: true,
    })
  );

  const vectors = response.vectors;
  let averageDistance = Infinity;

  if (vectors && vectors.length > 0) {
    averageDistance =
      vectors.reduce((acc, e) => (e.distance ? acc + e.distance : acc), 0) /
      vectors.length;
  }

  return {
    vectors,
    averageDistance,
  };
}
