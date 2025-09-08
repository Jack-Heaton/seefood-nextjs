import { getImages } from "@/actions/getImages";
import { GenerateImagesButton } from "./GenerateImagesButton";

export default async function Training() {
  const images = await getImages();

  return (
    <div className="flex flex-col gap-6">
      <GenerateImagesButton />

      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div className="flex flex-col gap-4" key={image.imageString}>
            <div>
              <img
                src={`data:image/png;base64,${image.imageString}`}
                alt="Image"
              />
              <div className="text-lg">
                Avg. Distance: {image.averageDistance}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
