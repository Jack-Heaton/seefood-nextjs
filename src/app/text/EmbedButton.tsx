"use client";

import { embedText } from "@/actions/embedText";
import { Button } from "@/components/ui/button";

export const EmbedButton = () => {
  return <Button onClick={embedText}>Embed</Button>;
};
