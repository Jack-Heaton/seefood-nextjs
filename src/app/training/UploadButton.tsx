"use client";

import { Card } from "@/components/ui/card";
import { useRef } from "react";

export const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(file);
    }
  };
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
      />
      <Card className="cursor-pointer">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="!p-2 hover:scale-105 transition-bounce"
        >
          Upload Image
        </button>
      </Card>
    </>
  );
};
