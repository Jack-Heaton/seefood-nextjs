# SEEFOOD 🌭

**Is it a hot dog? A "fun" primer on vectors, embeddings and similarity search, built on Amazon S3 Vectors.**

I built this for a talk at the local AWS User Group in September 2025. Amazon S3 Vectors had just come out, and I wanted a lighthearted way to show what embeddings are, how vector search works, and why "similar" is a number you can compute. The excuse was an app (yes, *that* SeeFood) that tells you how likely it is that a picture contains a hot dog.

It's demo code: no auth, no tests, and the AWS resources are set up by hand. The point is the ideas, not production hardening.

## How it works

1. **Build a reference set.** The Training page asks Amazon Titan Image Generator for pictures of hot dogs and stores them in S3. Each image is turned into a vector with Amazon Titan Multimodal Embeddings and written to an S3 Vectors index.
2. **Embed the photo you upload.** The upload goes through the same embedding model, so it lands in the same vector space as the reference hot dogs.
3. **Ask S3 Vectors for the nearest neighbors.** The app queries the 10 closest reference vectors and averages their distance.
4. **Decide.** If the average distance is under 0.6, it's a hot dog. Otherwise, not hot dog.

The index only contains hot dogs, so the classifier answers "how hot-dog-like is this?" rather than "what food is this?" That makes the edge cases fun to try on stage: pigs in a blanket, bratwurst, the Wienermobile, a stuffed pepper, a veggie dog. There's a pile of test images in [`samples/`](samples).

## The pages

| Route | What it shows |
| --- | --- |
| `/` | The classifier. Upload a photo and get hot dog / not hot dog, with the nearest-neighbor distances. |
| `/training` | Generate more reference hot dogs with Titan Image Generator and see every training image with its average distance to the rest of the set. |
| `/math` | Embedding arithmetic. Pick three images, compute `image1 ± image2`, and measure how close the result lands to `image3`. (The distance is logged to the server console.) |
| `/text` | Why retrieval matters. The same question goes to Amazon Nova Micro on its own and to a Bedrock Knowledge Base `RetrieveAndGenerate` call, side by side. Both answer as a New York City hot dog vendor. The bottom panel shows the Wikipedia hot dog article split into the 100-word chunks that get embedded. |

## Stack

- Next.js 15 (App Router, server actions), React 19, Tailwind CSS 4
- Amazon Bedrock: Titan Multimodal Embeddings G1, Titan Image Generator G1, Titan Text Embeddings V2, Nova Micro, Knowledge Bases
- Amazon S3 Vectors for the vector indexes, Amazon S3 for the images

## Running it yourself

You'll need an AWS account and credentials available to the AWS SDK (the default credential provider chain, such as `AWS_PROFILE`). Running this costs money for Bedrock calls and storage. It isn't much for a demo, but tear things down when you're done.

1. **Enable Bedrock model access**
   - `us-east-1`: Titan Multimodal Embeddings G1, Titan Image Generator G1, Titan Text Embeddings V2
   - `us-east-2`: Amazon Nova Micro (called through the `us.` cross-region inference profile)

   Titan Image Generator G1 may no longer be offered for new use. If it isn't, swap in another image model or upload your own hot dog photos as the reference set.

2. **Create the storage** in `us-east-2`
   - An S3 bucket for the reference images
   - An S3 Vectors bucket with two indexes: one for images and one for text. Both models output 1024-dimension vectors by default. The 0.6 cutoff in `src/components/HotdogClassifier.tsx` depends on the distance metric you choose, so expect to retune it.

3. **(Optional, for `/text`) Create a Bedrock Knowledge Base** over the hot dog article ([`pdf/Hot_dog.pdf`](pdf/Hot_dog.pdf)). Put its ID and the ARN of the model it should answer with (for example, the Nova Micro inference profile) in `KNOWLEDGE_BASE_ID` and `KB_MODEL_ARN` below.

4. **Configure** `.env.local`:

   ```bash
   FILES_BUCKET=your-image-bucket
   VECTOR_BUCKET=your-vector-bucket
   INDEX_NAME=your-image-index
   TEXT_INDEX_NAME=your-text-index

   # Only needed for /text
   KNOWLEDGE_BASE_ID=your-knowledge-base-id
   KB_MODEL_ARN=arn:aws:bedrock:us-east-2:<account-id>:inference-profile/us.amazon.nova-micro-v1:0
   ```

5. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000. Visit `/training` first and generate a few batches of hot dogs, because the classifier has nothing to compare against until the index has vectors in it.

## Credits

The hot dog text used on `/text` comes from Wikipedia's [Hot dog](https://en.wikipedia.org/wiki/Hot_dog) article, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The app's name is a nod to HBO's *Silicon Valley*.
