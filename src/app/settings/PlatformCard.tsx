"use client";

import { useState } from "react";
import { PostingPlatform } from "@prisma/client";
import { updatePlatformCredentials, deletePlatformConnection } from "../actions/platforms";
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink, 
  Loader2,
  Trash2,
  Lock
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface PlatformCardProps {
  platform: PostingPlatform;
  name: string;
  description: string;
  isConnected: boolean;
  fields?: Field[];
  isOAuth?: boolean;
  authUrl?: string;
}

export default function PlatformCard({
  platform,
  name,
  description,
  isConnected,
  fields,
  isOAuth,
  authUrl,
}: PlatformCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePlatformCredentials(platform, formData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    setLoading(true);
    try {
      await deletePlatformConnection(platform);
    } catch (error) {
      console.error(error);
      alert("Failed to delete connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group overflow-hidden bg-card border border-border rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-accent rounded-xl group-hover:scale-110 transition-transform">
             {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
             ) : (
                <XCircle className="w-6 h-6 text-muted-foreground" />
             )}
          </div>
          {isConnected && !isEditing && (
            <button 
              onClick={handleDelete}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-6 h-10 overflow-hidden line-clamp-2">
          {description}
        </p>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {fields?.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`${platform}-${field.name}`}>{field.label}</Label>
                <Input
                  id={`${platform}-${field.name}`}
                  type={field.type}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className="bg-accent/50 border-border focus:ring-primary"
                />
              </div>
            ))}
            <div className="flex space-x-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Encrypted Storage</span>
            </div>
            
            {isOAuth ? (
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group"
                onClick={() => window.location.href = authUrl!}
                disabled={loading}
              >
                {isConnected ? "Reconnect" : "Connect Account"}
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            ) : (
              <Button 
                variant={isConnected ? "outline" : "default"}
                className="w-full"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                {isConnected ? "Update Credentials" : "Setup Connection"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
