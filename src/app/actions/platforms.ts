"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { PostingPlatform } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updatePlatformCredentials(
  platform: PostingPlatform,
  credentials: Record<string, string>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  // Encrypt all credential values before storing
  const encryptedCredentials: Record<string, string> = {};
  for (const [key, value] of Object.entries(credentials)) {
    encryptedCredentials[key] = encrypt(value);
  }

  await prisma.platformConnection.upsert({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    update: {
      credentials: encryptedCredentials,
    },
    create: {
      userId,
      platform,
      credentials: encryptedCredentials,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deletePlatformConnection(platform: PostingPlatform) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  await prisma.platformConnection.delete({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
