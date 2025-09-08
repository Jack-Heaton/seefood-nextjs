import { S3VectorsClient, PutVectorsCommand } from "@aws-sdk/client-s3vectors"; // ES Modules import

const s3VectorsClient = new S3VectorsClient({
  region: "us-east-2",
});

export async function indexImages(
  imageEmbeddings: {
    key: string;
    embedding: number[];
  }[]
) {
  const indexResponse = await s3VectorsClient.send(
    new PutVectorsCommand({
      vectorBucketName: process.env.VECTOR_BUCKET,
      indexName: process.env.INDEX_NAME,

      vectors: imageEmbeddings.map((embedding) => ({
        data: {
          float32: embedding.embedding,
        },
        key: embedding.key,
      })),
    })
  );

  return indexResponse;
}
