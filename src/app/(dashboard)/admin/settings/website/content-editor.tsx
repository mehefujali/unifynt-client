import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ContentEditor({ content, onChange }: any) {
  const handleHeroChange = (key: string, value: string) => {
    onChange({
      ...content,
      hero: { ...(content.hero || {}), [key]: value }
    });
  };

  const handleFooterChange = (key: string, value: string) => {
    onChange({
      ...content,
      footer: { ...(content.footer || {}), [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["hero"]} className="w-full space-y-4">
        <AccordionItem value="hero" className="border rounded-xl bg-card px-2 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-5 px-4 rounded-xl">
            <div className="flex flex-col text-left gap-1">
              <span className="font-bold text-lg text-foreground">Hero Section</span>
              <span className="text-sm font-normal text-muted-foreground">Update the main landing banner text and images.</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 px-4 space-y-6">
            <div className="space-y-2.5">
              <Label className="font-semibold">Badge Text (Top)</Label>
              <Input 
                value={content.hero?.badgeText || ""} 
                onChange={(e) => handleHeroChange("badgeText", e.target.value)}
                placeholder="e.g. Admissions Open for 2026-2027"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <Label className="font-semibold">Title (Part 1)</Label>
                <Input 
                  value={content.hero?.titlePart1 || ""} 
                  onChange={(e) => handleHeroChange("titlePart1", e.target.value)}
                  placeholder="e.g. Empowering"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="font-semibold">Title (Highlight)</Label>
                <Input 
                  value={content.hero?.titleHighlight || ""} 
                  onChange={(e) => handleHeroChange("titleHighlight", e.target.value)}
                  placeholder="e.g. Minds"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="font-semibold">Title (Part 2)</Label>
                <Input 
                  value={content.hero?.titlePart2 || ""} 
                  onChange={(e) => handleHeroChange("titlePart2", e.target.value)}
                  placeholder="e.g. , Shaping Futures."
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="font-semibold">Main Description</Label>
              <Textarea 
                value={content.hero?.description || ""} 
                onChange={(e) => handleHeroChange("description", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="font-semibold">Primary Button Text</Label>
                <Input 
                  value={content.hero?.primaryButtonText || ""} 
                  onChange={(e) => handleHeroChange("primaryButtonText", e.target.value)}
                />
              </div>
              <div className="space-y-2.5">
                <Label className="font-semibold">Secondary Button Text</Label>
                <Input 
                  value={content.hero?.secondaryButtonText || ""} 
                  onChange={(e) => handleHeroChange("secondaryButtonText", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="font-semibold">Hero Background Image URL</Label>
              <Input 
                value={content.hero?.image || ""} 
                onChange={(e) => handleHeroChange("image", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="footer" className="border rounded-xl bg-card px-2 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-5 px-4 rounded-xl">
            <div className="flex flex-col text-left gap-1">
              <span className="font-bold text-lg text-foreground">Footer Section</span>
              <span className="text-sm font-normal text-muted-foreground">Manage footer branding and copyright.</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 px-4 space-y-6">
            <div className="space-y-2.5">
              <Label className="font-semibold">Powered By Text</Label>
              <Input 
                value={content.footer?.poweredBy || ""} 
                onChange={(e) => handleFooterChange("poweredBy", e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}