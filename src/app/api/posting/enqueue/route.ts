import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueuePostingJob } from "@/lib/queue/posting-queue";
import { PostingPlatform } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { productId, platform } = await req.json();

  if (!productId || !platform) {
    return NextResponse.json({ error: "Product ID and Platform are required" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        aiContent: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if platform connection exists
    const connection = await prisma.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platform as PostingPlatform,
        },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: `Please connect your ${platform} account in settings first.` }, { status: 400 });
    }

    // Create the platform listing record
    const platformListing = await prisma.platformListing.create({
      data: {
        productId,
        platform: platform as PostingPlatform,
        status: "PENDING",
      },
    });

    // Enqueue the job
    const jobId = await enqueuePostingJob({
      platformListingId: platformListing.id,
      productId: product.id,
      userId,
      platform,
      listing: {
        title: product.aiContent?.title || product.title || "",
        description: product.aiContent?.description || product.description || "",
        price: Number(product.price || 0),
        category: product.category || "General",
        condition: product.condition || "GOOD",
        images: product.images.map((img) => img.originalUrl).filter(Boolean) as string[],
      },
    });

    // Update with jobId
    await prisma.platformListing.update({
      where: { id: platformListing.id },
      data: { jobId },
    });

    return NextResponse.json({ success: true, platformListingId: platformListing.id, jobId });
  } catch (error) {
    console.error("Enqueue error:", error);
    return NextResponse.json({ error: "Failed to enqueue posting job" }, { status: 500 });
  }
}
