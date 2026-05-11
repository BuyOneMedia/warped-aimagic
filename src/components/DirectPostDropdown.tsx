"use client";

import { useState } from "react";
import { 
  Send, 
  Facebook, 
  ShoppingBag, 
  Monitor, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Store
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Button from "@/components/ui/Button";

interface DirectPostDropdownProps {
  productId: string;
  productTitle: string;
}

export default function DirectPostDropdown({ productId, productTitle }: DirectPostDropdownProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ platform: string; type: 'success' | 'error'; message: string } | null>(null);

  const handlePost = async (platform: string) => {
    setLoading(platform);
    setStatus(null);
    try {
      const res = await fetch("/api/posting/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, platform }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ 
          platform, 
          type: 'success', 
          message: `Job queued for ${platform}. Check back in a few minutes.` 
        });
      } else {
        setStatus({ 
          platform, 
          type: 'error', 
          message: data.error || "Failed to queue job" 
        });
      }
    } catch (error) {
      setStatus({ platform, type: 'error', message: "Connection error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-border bg-card/95 backdrop-blur-md">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Post
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          
          <DropdownMenuItem 
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => handlePost("FACEBOOK")}
            disabled={!!loading}
          >
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <Facebook className="w-4 h-4 text-blue-600" />
            </div>
            <span className="flex-1 font-medium">Facebook Marketplace</span>
            {loading === "FACEBOOK" && <Loader2 className="w-4 h-4 animate-spin" />}
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
            onClick={() => handlePost("OFFERUP")}
            disabled={!!loading}
          >
            <div className="p-1.5 bg-orange-500/10 rounded-md">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
            </div>
            <span className="flex-1 font-medium">OfferUp</span>
            {loading === "OFFERUP" && <Loader2 className="w-4 h-4 animate-spin" />}
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-purple-500/10 hover:text-purple-600 transition-colors"
            onClick={() => handlePost("CRAIGSLIST")}
            disabled={!!loading}
          >
            <div className="p-1.5 bg-purple-500/10 rounded-md">
              <Monitor className="w-4 h-4 text-purple-600" />
            </div>
            <span className="flex-1 font-medium">Craigslist</span>
            {loading === "CRAIGSLIST" && <Loader2 className="w-4 h-4 animate-spin" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/50" />
          
          <DropdownMenuItem 
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
            onClick={() => handlePost("EBAY")}
            disabled={!!loading}
          >
            <div className="p-1.5 bg-emerald-500/10 rounded-md">
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="flex-1 font-medium">eBay API</span>
            {loading === "EBAY" && <Loader2 className="w-4 h-4 animate-spin" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {status && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 animate-in slide-in-from-bottom-5 duration-300 ${
          status.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-700' : 'bg-destructive/10 border-destructive/50 text-destructive'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{status.message}</span>
          <button onClick={() => setStatus(null)} className="p-1 hover:bg-black/5 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
