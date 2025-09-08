"use server";

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function embed(file: string) {
  const embedResponse = await bedrockClient.send(
    new InvokeModelCommand({
      modelId: "amazon.titan-embed-image-v1",
      body: new TextEncoder().encode(
        JSON.stringify({
          inputImage: file,
        })
      ),
    })
  );

  const embedResponseBody = new TextDecoder().decode(embedResponse.body);

  const embedding = JSON.parse(embedResponseBody).embedding;

  return {
    modelName: "Amazon Titan Embed Image v1",
    embedding: embedding,
  };
}
