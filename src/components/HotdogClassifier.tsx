"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CircleCheck, CircleX, Upload } from "lucide-react";
import { Loader } from "./ui/loader";
import { embed } from "@/actions/embed";
import { query } from "@/actions/query";
import { getImage } from "@/actions/getImages";
import { twMerge } from "tailwind-merge";

const HotdogClassifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<
    "EMBEDDING" | "COMPARING" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [foodType, setFoodType] = useState<"hotdog" | "not-hotdog" | null>(
    null
  );

  const [knnAverageDistance, setKnnAverageDistance] = useState<number | null>(
    null
  );
  const [knnResponse, setKnnResponse] = useState<
    | {
        key: string;
        distance: number;
        imageString: string;
      }[]
    | null
  >(null);

  const [embeddingResponse, setEmbeddingResponse] = useState<{
    modelName: string;
    embedding: number[];
  } | null>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsClassifying("EMBEDDING");

      const reader = new FileReader();
      reader.onload = async (e) => {
        setIsClassifying("EMBEDDING");
        const image = e.target?.result as string;
        setSelectedImage(image);
        setEmbeddingResponse(await embed(image.split(",")[1]));
        setIsClassifying("COMPARING");

        const queryResponse = await query(image.split(",")[1]);

        if (queryResponse && queryResponse.vectors) {
          setKnnAverageDistance(queryResponse.averageDistance);
          setKnnResponse(
            await Promise.all(
              queryResponse.vectors?.map(async (response) => ({
                key: response.key || "",
                distance: response.distance || Infinity,
                imageString:
                  (await getImage(response.key || "")).imageString || "",
              }))
            )
          );
        }

        if (queryResponse.averageDistance < 0.6) {
          setFoodType("hotdog");
        } else {
          setFoodType("not-hotdog");
        }
        setIsClassifying(null);
      };
      const fileString = reader.readAsDataURL(file);
    }
  };

  const knnImages = useCallback(async () => {
    return await Promise.all(
      knnResponse?.map(async (response) => (
        <img
          src={`data:image/png;base64,${
            (
              await getImage(response.key)
            ).imageString
          }`}
          alt="KNN Image"
        />
      )) || []
    );
  }, [knnResponse]);

  const resetClassifier = () => {
    setSelectedImage(null);
    setEmbeddingResponse(null);
    setKnnResponse(null);
    setKnnAverageDistance(null);
    setIsClassifying(null);
    setFoodType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-5">
          <div className="font-pixel text-6xl text-primary flex flex-row justify-center items-center gap-5 leading-tight">
            {/* <div className="relative -top-2">👀</div> */}
            <div className="flex justify-center items-center">SEEFOOD</div>
            {/* <div className="relative -top-2">👀</div> */}
          </div>

          {/* <div className=" text-accent font-pixel text-2xl flex justify-center items-center gap-3">
            <div className="relative -top-1">🔥</div>
            <div className=" relative">LIKE SHAZAM, FOR FOOD!</div>
            <div className="relative -top-1">🔥</div>
          </div>

          <div className="font-pixel text-2xl text-xl text-foreground font-bold flex justify-center items-center gap-3">
            <div className="relative -top-1">↖️</div>
            <div className=" relative">POWERED BY VECTORS AND AI!</div>
            <div className="relative -top-1">↗️</div>
          </div> */}
        </div>

        {/* Main Interface */}
        <Card className="!w-128 min-w-128">
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />

              {!selectedImage ? (
                <div className="border-retro border-dashed bg-muted/20 rounded-lg transition-bounce hover:scale-105">
                  <button
                    className="cursor-pointer !p-12"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="font-pixel text-2xl text-card-foreground flex flex-row items-center justify-center gap-3">
                      {/* <div className="relative -top-1">📷</div> */}
                      <div className=" relative">UPLOAD A FOOD PICTURE</div>
                      {/* <div className="relative -top-1">📷</div> */}
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={selectedImage}
                    alt="Selected for classification"
                    className="min-w-full"
                  />
                  {isClassifying && (
                    <div className="absolute inset-0 flex justify-center items-center">
                      <Loader />
                    </div>
                  )}

                  <div className="absolute bottom-0 flex justify-center items-center w-full text-xl">
                    {isClassifying && (
                      <div className="bg-black/50 w-full !p-2">
                        {isClassifying}...
                      </div>
                    )}
                    {foodType === "hotdog" && (
                      <div className="bg-green-600/75 w-full text-white !p-2 gap-2 flex flex-row items-center justify-center">
                        <CircleCheck /> HOTDOG
                      </div>
                    )}
                    {foodType === "not-hotdog" && (
                      <div className="bg-red-600/75 w-full text-white !p-2 gap-2 flex flex-row items-center justify-center">
                        <CircleX /> NOT HOTDOG
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {embeddingResponse && (
          <Card className="!w-128 min-w-128 !p-2 text-start ">
            <div className="text-lg flex flex-col gap-2">
              <div>{embeddingResponse.modelName} says:</div>
              <div className="">
                {`${
                  embeddingResponse.embedding.length
                } values: ${embeddingResponse.embedding
                  .slice(0, 25)
                  .map((v) => v.toFixed(3))
                  .join(", ")} ...`}
              </div>
            </div>
          </Card>
        )}

        {knnResponse && (
          <Card className="!w-128 min-w-128 !p-2 text-start ">
            <div className="text-lg flex flex-col gap-2">
              <div>k Nearest Neighbors</div>
              <div className="flex flex-row gap-2 justify-between">
                <div>Average Distance: {knnAverageDistance?.toFixed(3)}</div>
                <div>Cuttoff: 0.6</div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {knnResponse.map((response) => (
                  <div key={response.key}>
                    <img
                      src={`data:image/png;base64,${response.imageString}`}
                      alt="KNN Image"
                    />
                    <div
                      className={twMerge(
                        "text-center",
                        response.distance > 0.6 ? "bg-red-500" : "bg-green-500"
                      )}
                    >
                      {response.distance.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {foodType && (
          <Card className={`font-pixel !`}>
            <button
              onClick={resetClassifier}
              className="hover:scale-110 transition-bounce !p-4"
            >
              Reset
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HotdogClassifier;
