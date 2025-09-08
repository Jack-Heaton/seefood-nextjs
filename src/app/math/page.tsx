"use client";

import { embed } from "@/actions/embed";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { doMath } from "@/actions/manualMath";

export default function Math() {
  const [operator, setOperator] = useState<"+" | "-">("+");

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const [image1, setImage1] = useState<{
    embedding: number[] | null;
    image: string | null;
  } | null>(null);
  const [image2, setImage2] = useState<{
    embedding: number[] | null;
    image: string | null;
  } | null>(null);
  const [image3, setImage3] = useState<{
    embedding: number[] | null;
    image: string | null;
  } | null>(null);

  async function handleImageSelect(
    element: HTMLInputElement,
    setImage: (
      image: {
        embedding: number[] | null;
        image: string | null;
      } | null
    ) => void
  ) {
    console.log(element);
    const file = element.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const image = e.target?.result as string;
        const embedding = await embed(image.split(",")[1]);
        setImage({
          embedding: embedding.embedding,
          image: image,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    console.log(image1);
  }, [image1]);

  async function handleDoMath() {
    if (image1?.embedding && image2?.embedding && image3?.embedding) {
      await doMath(
        image1?.embedding,
        image2?.embedding,
        image3?.embedding,
        operator
      );
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="font-pixel flex flex-col gap-4">
        <Card className="w-64 h-64 overflow-hidden">
          <button
            onClick={() => fileInputRef1.current?.click()}
            className="min-w-full min-h-full text-2xl flex items-center justify-center"
            key={JSON.stringify(image1 || {})}
          >
            <div className="h-64 w-64 max-h-64 max-w-64 overflow-hidden">
              {image1?.image ? (
                <img
                  src={image1.image}
                  alt="Image 1"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Image 1"
              )}
            </div>
          </button>
          <input
            ref={fileInputRef1}
            onChange={(e) => handleImageSelect(e.target, setImage1)}
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload1"
          />
        </Card>

        <div className="flex flex-row gap-2 justify-center text-3xl">
          <Card
            className={twMerge(
              "flex items-center justify-center",
              operator === "+" && "bg-white text-black"
            )}
          >
            <button onClick={() => setOperator("+")} className="h-16 w-16">
              +
            </button>
          </Card>

          <Card
            className={twMerge(
              "flex items-center justify-center",
              operator === "-" && "bg-white text-black"
            )}
          >
            <button onClick={() => setOperator("-")} className="h-16 w-16">
              -
            </button>
          </Card>
        </div>

        <Card className="w-64 h-64 overflow-hidden">
          <div className="text-2xl">
            <button onClick={() => fileInputRef2.current?.click()}>
              {image2?.image ? (
                <img
                  src={image2.image}
                  alt="Image 2"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Image 2"
              )}
            </button>
          </div>
          <input
            ref={fileInputRef2}
            onChange={(e) => handleImageSelect(e.target, setImage2)}
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload2"
          />
        </Card>

        <div className="flex flex-row gap-2 justify-center text-3xl">=</div>
        <Card className="w-64 h-64 overflow-hidden">
          <div className="text-2xl">
            <button onClick={() => fileInputRef3.current?.click()}>
              {image3?.image ? (
                <img
                  src={image3.image}
                  alt="Image 3"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Image 3"
              )}
            </button>
          </div>
          <input
            ref={fileInputRef3}
            onChange={(e) => handleImageSelect(e.target, setImage3)}
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
        </Card>

        <Card className={`font-pixel !`}>
          <button
            onClick={handleDoMath}
            className="hover:scale-110 transition-bounce !p-4"
          >
            Do Math!
          </button>
        </Card>
      </div>
    </div>
  );
}
