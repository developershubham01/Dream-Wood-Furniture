"use client";

import { useRef, useState } from "react";
import { Upload, Link2, Loader2, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

/** Image URL field with upload-from-device support (admin only) */
export function ImageField({
  value,
  onChange,
  label = "Image",
  aspect = "aspect-[4/3]",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");

  const handleFile = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 3MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.url);
      toast({ title: "Image uploaded" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-walnut-900">{label}</label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "url" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("url")}
          >
            <Link2 className="h-3 w-3 mr-1" /> URL
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "upload" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("upload")}
          >
            <Upload className="h-3 w-3 mr-1" /> Upload
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <div className={`${aspect} w-24 shrink-0 rounded-xl overflow-hidden border border-walnut-200 bg-walnut-50 flex items-center justify-center`}>
          {value ? (
             
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-walnut-300" aria-hidden />
          )}
        </div>
        <div className="flex-1 space-y-2">
          {mode === "url" ? (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/images/example.png or https://…"
              className="h-9 rounded-lg border-walnut-200 focus-visible:ring-gold text-sm"
            />
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="h-9 rounded-lg border-walnut-300 text-walnut-700 hover:bg-walnut-50 text-sm w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Choose image (max 3MB)
                  </>
                )}
              </Button>
            </>
          )}
          {mode === "url" && (
            <p className="text-[11px] text-muted-foreground">
              Tip: use /images/… paths from this site or any https image URL
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Multi-image manager for products */
export function ImagesField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-walnut-900">
          Product Images ({images.length})
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden border border-walnut-200 aspect-square bg-walnut-50">
            { }
            <img src={img} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-walnut-800/90 text-ivory text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
              aria-label={`Remove image ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        <ImageField
          value=""
          onChange={(url) => url && onChange([...images, url])}
          label=""
          aspect="aspect-square"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        First image is the cover. Upload more to build a gallery for this piece.
      </p>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-walnut-100">
      <div>
        <h1 className="font-display text-2xl text-walnut-900">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-gold/20 text-gold-dark" },
  { value: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-800" },
  { value: "quoted", label: "Quoted", color: "bg-violet-100 text-violet-800" },
  { value: "won", label: "Won", color: "bg-emerald-100 text-emerald-800" },
  { value: "archived", label: "Archived", color: "bg-walnut-100 text-walnut-700" },
] as const;
