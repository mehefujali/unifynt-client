/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageCropperProps {
  aspectRatio?: number;
  onCrop: (file: File | null) => void;
  previewUrl?: string | null;
  label?: string;
  shape?: "rect" | "round";
}

export default function ImageCropper({
  aspectRatio = 1,
  onCrop,
  previewUrl: initialPreview,
  label = "Upload Image",
  shape = "round"
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
      setIsModalOpen(true);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels, "profile.jpg");
        if (croppedImageFile) {
          const previewUrl = URL.createObjectURL(croppedImageFile);
          setPreview(previewUrl);
          onCrop(croppedImageFile);
          setIsModalOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onCrop]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setImageSrc(null);
    onCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-muted/20 hover:bg-muted/50 border-border hover:border-primary/50
          ${shape === "round" ? "rounded-full w-28 h-28" : "rounded-xl w-full h-32"}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="text-white h-6 w-6" />
            </div>
            <button 
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
            <UploadCloud className="h-7 w-7 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">{label}</span>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background border-border shadow-2xl">
          <DialogHeader className="p-4 border-b border-border/50 bg-muted/20">
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Crop Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-[350px] bg-black/5">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropShape={shape}
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          
          <div className="p-4 bg-muted/10 border-t border-border/50 flex items-center justify-between gap-4">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button size="sm" className="font-bold shadow-md" onClick={showCroppedImage}>Crop & Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}