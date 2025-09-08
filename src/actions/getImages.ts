"use server";

import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { query } from "./query";

const s3Client = new S3Client({
  region: "us-east-2",
});

export async function getImages() {
  const response = await s3Client.send(
    new ListObjectsCommand({
      Bucket: process.env.FILES_BUCKET,
    })
  );

  return await Promise.all(
    response.Contents?.map(async (item) => getImage(item.Key || "")) || []
  );
}

export async function getImage(key: string) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.FILES_BUCKET,
      Key: key,
    })
  );

  const imageString = await response.Body?.transformToString("base64");

  let averageDistance = Infinity;

  if (!response.Metadata?.averageDistance) {
    if (imageString) {
      averageDistance = (await query(imageString)).averageDistance;
    }
  }

  const newMetadata = {
    ...response.Metadata,
    averageDistance: String(averageDistance),
  };

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: process.env.FILES_BUCKET,
      Key: key,
      CopySource: `${process.env.FILES_BUCKET}/${key}`,
      MetadataDirective: "REPLACE",
      Metadata: newMetadata,
    })
  );

  return { imageString, averageDistance };
}
