import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostingPlatform } from "@prisma/client";
import PlatformCard from "./PlatformCard";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const connections = await prisma.platformConnection.findMany({
    where: { userId },
  });

  const connectionMap = connections.reduce((acc, conn) => {
    acc[conn.platform] = true;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
          Marketplace Connections
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your platform credentials and API tokens. All credentials are encrypted with AES-256-GCM.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Facebook Marketplace */}
        <PlatformCard
          platform={PostingPlatform.FACEBOOK}
          name="Facebook Marketplace"
          description="Direct posting via browser automation"
          isConnected={connectionMap[PostingPlatform.FACEBOOK]}
          fields={[
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
          ]}
        />

        {/* OfferUp */}
        <PlatformCard
          platform={PostingPlatform.OFFERUP}
          name="OfferUp"
          description="Automated local listing creation"
          isConnected={connectionMap[PostingPlatform.OFFERUP]}
          fields={[
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
          ]}
        />

        {/* Craigslist */}
        <PlatformCard
          platform={PostingPlatform.CRAIGSLIST}
          name="Craigslist"
          description="Automated posting for local classifieds"
          isConnected={connectionMap[PostingPlatform.CRAIGSLIST]}
          fields={[
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
            { name: "area", label: "Area Code (e.g. sfbay)", type: "text", required: true },
          ]}
        />

        {/* eBay */}
        <PlatformCard
          platform={PostingPlatform.EBAY}
          name="eBay"
          description="Official Inventory API Integration"
          isConnected={connectionMap[PostingPlatform.EBAY]}
          isOAuth={true}
          authUrl="/api/auth/ebay"
        />

        {/* Etsy */}
        <PlatformCard
          platform={PostingPlatform.ETSY}
          name="Etsy"
          description="Official Open API v3 Integration"
          isConnected={connectionMap[PostingPlatform.ETSY]}
          isOAuth={true}
          authUrl="/api/auth/etsy"
        />
      </div>
    </div>
  );
}
