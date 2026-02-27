/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ThemeEditor({ theme, onChange }: any) {
  const handleColorChange = (key: string, value: string) => {
    onChange({
      ...theme,
      colors: { ...theme.colors, [key]: value }
    });
  };

  const toggleSection = (sectionId: string, checked: boolean) => {
    let newHidden = [...(theme.hiddenSections || [])];
    if (checked) {
      newHidden = newHidden.filter((id: string) => id !== sectionId);
    } else {
      if (!newHidden.includes(sectionId)) newHidden.push(sectionId);
    }
    onChange({ ...theme, hiddenSections: newHidden });
  };

  const isVisible = (sectionId: string) => !(theme.hiddenSections || []).includes(sectionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Customize the primary and secondary colors of your website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-3">
              <Label className="text-sm font-semibold">Primary Color</Label>
              <div className="flex gap-3 items-center">
                <div className="relative overflow-hidden rounded-md border h-10 w-14 shrink-0 shadow-sm">
                  <input 
                    type="color" 
                    value={theme.colors?.primary || "#4f46e5"} 
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="absolute -inset-2 h-20 w-20 cursor-pointer"
                  />
                </div>
                <Input 
                  type="text" 
                  value={theme.colors?.primary || "#4f46e5"} 
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="uppercase font-mono tracking-wider"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-3">
              <Label className="text-sm font-semibold">Secondary Color</Label>
              <div className="flex gap-3 items-center">
                <div className="relative overflow-hidden rounded-md border h-10 w-14 shrink-0 shadow-sm">
                  <input 
                    type="color" 
                    value={theme.colors?.secondary || "#7c3aed"} 
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    className="absolute -inset-2 h-20 w-20 cursor-pointer"
                  />
                </div>
                <Input 
                  type="text" 
                  value={theme.colors?.secondary || "#7c3aed"} 
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="uppercase font-mono tracking-wider"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <CardDescription>Toggle which sections should be visible on your public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Hero Section</Label>
              <p className="text-sm text-muted-foreground">The main banner at the top of the site.</p>
            </div>
            <Switch 
              checked={isVisible("hero")} 
              onCheckedChange={(c) => toggleSection("hero", c)} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">About Us Section</Label>
              <p className="text-sm text-muted-foreground">Information about your institution.</p>
            </div>
            <Switch 
              checked={isVisible("about")} 
              onCheckedChange={(c) => toggleSection("about", c)} 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Facilities Section</Label>
              <p className="text-sm text-muted-foreground">Grid showing campus facilities.</p>
            </div>
            <Switch 
              checked={isVisible("facilities")} 
              onCheckedChange={(c) => toggleSection("facilities", c)} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}