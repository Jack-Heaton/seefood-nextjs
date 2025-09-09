"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { invokeModel, retrieveAndGenerate } from "@/actions/invokeModel";

export const Panels = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [invokeModelResponse, setInvokeModelResponse] = useState("");
  const [retrieveAndGenerateResponse, setRetrieveAndGenerateResponse] =
    useState("");

  async function handleGenerate() {
    setIsGenerating(true);
    setPrompt("");
    setInvokeModelResponse("");
    setRetrieveAndGenerateResponse("");
    const [invokeResponse, retrieveResponse] = await Promise.all([
      invokeModel(prompt),
      retrieveAndGenerate(prompt),
    ]);
    setInvokeModelResponse(invokeResponse);
    setRetrieveAndGenerateResponse(retrieveResponse || "");
    setIsGenerating(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b-2 border-white !p-4 flex flex-row gap-4 text-xl ">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything about hotdogs"
          className="grow text-2xl"
        />
        <Card>
          <Button
            className="!p-2 hover:scale-110 transition-bounce !font-pixel"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </Card>
      </div>
      <div className="flex flex-row grow max-h-full overflow-y-auto">
        <div className="border-r-2 border-white !p-4 flex-1/2 flex flex-col gap-4 max-h-full overflow-y-auto">
          <div className="font-pixel">From KB</div>
          <div
            className="text-2xl"
            dangerouslySetInnerHTML={{
              __html: invokeModelResponse.replaceAll("\n", "<br>"),
            }}
          />
        </div>
        <div className="!p-4 flex-1/2 flex flex-col gap-4 max-h-full overflow-y-auto">
          <div className="font-pixel">No KB</div>
          <div
            className="text-2xl"
            dangerouslySetInnerHTML={{
              __html: retrieveAndGenerateResponse.replaceAll("\n", "<br>"),
            }}
          />
        </div>
      </div>
    </div>
  );
};
