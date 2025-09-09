"use server";

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import {
  BedrockAgentRuntimeClient,
  BedrockAgentRuntimeClientConfig,
  SearchType,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import {
  GetVectorsCommand,
  ListVectorsCommand,
  S3VectorsClient,
} from "@aws-sdk/client-s3vectors";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-2",
});

const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: "us-east-2",
});

const vectorStoreClient = new S3VectorsClient({
  region: "us-east-2",
});

const modelId = "us.amazon.nova-micro-v1:0";

export async function invokeModel(prompt: string) {
  const response = await bedrockClient.send(
    new InvokeModelCommand({
      modelId,
      body: new TextEncoder().encode(
        JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  text: `You are a helpful assistant that can answer questions about the user's prompt based on the contents o the knowledge base. The knowledge base only constains information about hotdogs.

          Answer all questions as if you were a New York City hotdog vendor.`,
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        })
      ),
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  console.log(responseBody.output.message);

  return responseBody.output.message.content[0].text;
}

export async function retrieveAndGenerate(prompt: string) {
  const list = await vectorStoreClient.send(
    new GetVectorsCommand({
      vectorBucketName: process.env.VECTOR_BUCKET,
      indexName: process.env.TEXT_INDEX_NAME,
      keys: ["wikitext-0"],
      returnData: true,
      returnMetadata: true,
    })
  );

  const response = await bedrockAgentClient.send(
    new RetrieveAndGenerateCommand({
      input: {
        // KnowledgeBaseQuery
        text: prompt, // required
      },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          modelArn:
            "arn:aws:bedrock:us-east-2:053789260438:inference-profile/us.amazon.nova-micro-v1:0",
          knowledgeBaseId: "DXPDPDJTPU", // required
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 25,
              overrideSearchType: SearchType.SEMANTIC,
            },
          },
          generationConfiguration: {
            promptTemplate: {
              textPromptTemplate: `You are a helpful assistant that can answer questions about the user's prompt based on the contents o the knowledge base. The knowledge base only constains information about hotdogs.

          Answer all questions as if you were a New York City hotdog vendor.
          
          Here is the user's question:
          $query$

          And the search results are:
          $search_results$
          
          $output_format_instructions$
          `,
            },
          },
        },
      },
    } as RetrieveAndGenerateCommandInput)
  );

  return response.output?.text;
}
