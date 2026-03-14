"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SeoEditorProps {
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  onChange: (seo: any) => void;
}

export function SeoEditor({ seo, onChange }: SeoEditorProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...seo, [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground mb-1">SEO & Social Meta</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
          Optimize how your school appears in search engines and social media.
        </p>
      </div>

      <div className="space-y-4">
        {/* Meta Title */}
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
            Page Title (SEO)
            <span className="text-[8px] font-medium text-muted-foreground lowercase">Recommended: 50-60 characters</span>
          </Label>
          <Input
            value={seo?.metaTitle || ""}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="e.g., Best Primary School in Kolkata - Green Academy"
            className="h-10 text-[11px] font-medium placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
            Meta Description
            <span className="text-[8px] font-medium text-muted-foreground lowercase">Recommended: 150-160 characters</span>
          </Label>
          <Textarea
            value={seo?.metaDescription || ""}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="Describe your school to parents and students..."
            className="min-h-[100px] text-[11px] font-medium resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Meta Keywords */}
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
            Keywords
            <span className="text-[8px] font-medium text-muted-foreground lowercase">Separate with commas</span>
          </Label>
          <Input
            value={seo?.metaKeywords || ""}
            onChange={(e) => handleChange("metaKeywords", e.target.value)}
            placeholder="school, education, kolkata, admissions, 2024"
            className="h-10 text-[11px] font-medium placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t border-border">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">Google Preview</h4>
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-1.5">
          <p className="text-[14px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
            {seo?.metaTitle || "School Name | Managed by Unifynt"}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-500 font-medium truncate">
            https://yourdomain.com
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {seo?.metaDescription || "Experience the best education for your child. Visit our website to learn more about our curriculum and admissions process."}
          </p>
        </div>
      </div>
    </div>
  );
}
