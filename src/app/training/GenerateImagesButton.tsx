"use client";

import { generateImages } from "@/actions/generateImages";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
});

export const GenerateImagesButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const handleGenerateImages = async () => {
    setIsGenerating(true);
    const images = await generateImages();
    setIsGenerating(false);
    router.push("/training?timestamp=" + Date.now());
  };

  return (
    <Card className={`${pressStart2P.className} !p-2`}>
      <button
        onClick={handleGenerateImages}
        disabled={isGenerating}
        className="hover:scale-110 transition-bounce text-center w-full"
      >
        {isGenerating ? "Generating..." : "Generate Images"}
      </button>
    </Card>
  );
};
