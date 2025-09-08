"use server";

import {
  InvokeModelCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { embed } from "./embed";
import { indexImages } from "./indexImages";

const s3Client = new S3Client({
  region: "us-east-2",
});

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function generateImages() {
  const request = new InvokeModelCommand({
    modelId: "amazon.titan-image-generator-v1",
    body: new TextEncoder().encode(
      JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: "Create an image of a hot dog",
        },
        imageGenerationConfig: {
          numberOfImages: 5,
          width: 576,
          height: 384,
          seed: Math.floor(Math.random() * 2147483646),
        },
      })
    ),
  });

  const response = await bedrockClient.send(request);

  const responseBody = new TextDecoder().decode(response.body);
  const responseBodyJson = JSON.parse(responseBody);

  // Get image embeddings

  await Promise.all(
    responseBodyJson.images.map(async (image: string) => {
      await embed(image);
    })
  );

  // Store image imbeddings in S3 Vector Store

  // Store images in S3

  const imageEmbeddings = await Promise.all(
    responseBodyJson.images.map(async (image: string) => {
      const key = crypto.randomUUID() + ".png";

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.FILES_BUCKET,
          Key: key,
          Body: Buffer.from(image, "base64"),
        })
      );

      const { embedding } = await embed(image);

      return {
        key,
        embedding,
      };
    })
  );

  await indexImages(imageEmbeddings);
}
