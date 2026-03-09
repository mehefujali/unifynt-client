"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MarksheetConfig } from "@/types/marksheet-config";

interface Props {
    config: MarksheetConfig;
    onChange: (newConfig: MarksheetConfig) => void;
}

export function BuilderEditor({ config, onChange }: Props) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSection = <K extends keyof MarksheetConfig>(section: K, key: keyof MarksheetConfig[K], value: any) => {
        onChange({
            ...config,
            [section]: {
                ...config[section],
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-zinc-200" defaultValue="design">

                {/* DESIGN SETTINGS */}
                <AccordionItem value="design" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-zinc-800">1. Global Design</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="space-y-2">
                            <Label>Theme Color</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={config.design.themeColor} onChange={(e) => updateSection('design', 'themeColor', e.target.value)} />
                                <Input type="text" className="uppercase font-mono text-sm" value={config.design.themeColor} onChange={(e) => updateSection('design', 'themeColor', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-4 border-t pt-4 border-zinc-100">
                            <Label className="font-bold text-zinc-800">Background Watermark</Label>
                            <RadioGroup
                                value={config.design.watermarkType}
                                onValueChange={(v) => updateSection('design', 'watermarkType', v as "image" | "text" | "none")}
                                className="flex flex-col gap-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id="wm-img" />
                                    <Label htmlFor="wm-img">School Logo (Large)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="text" id="wm-txt" />
                                    <Label htmlFor="wm-txt">Custom Text Overlay</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="wm-none" />
                                    <Label htmlFor="wm-none">None (Hidden)</Label>
                                </div>
                            </RadioGroup>

                            {config.design.watermarkType === "text" && (
                                <div className="space-y-2 pl-6">
                                    <Label className="text-xs text-zinc-500">Watermark Text</Label>
                                    <Input value={config.design.customWatermarkText} onChange={(e) => updateSection('design', 'customWatermarkText', e.target.value)} />
                                </div>
                            )}

                            {config.design.watermarkType !== "none" && (
                                <div className="space-y-4 pl-6 pt-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-zinc-500">Watermark Opacity: {config.design.watermarkOpacity}%</Label>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={20}
                                        step={1}
                                        value={config.design.watermarkOpacity}
                                        onChange={(e) => updateSection('design', 'watermarkOpacity', parseInt(e.target.value))}
                                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-px bg-zinc-200 mx-4" />

                {/* HEADER SETTINGS */}
                <AccordionItem value="header" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-zinc-800">2. Header details</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="flex items-center justify-between pb-3">
                            <Label className="flex-1 cursor-pointer">Show School Logo</Label>
                            <Switch checked={config.header.showLogo} onCheckedChange={(v) => updateSection('header', 'showLogo', v)} />
                        </div>
                        <div className="space-y-2 border-t border-zinc-100 pt-3">
                            <Label>Header Font Size</Label>
                            <Select value={config.header.titleSize} onValueChange={(v) => updateSection('header', 'titleSize', v as "sm" | "md" | "lg" | "xl")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sm">Small</SelectItem>
                                    <SelectItem value="md">Medium</SelectItem>
                                    <SelectItem value="lg">Large</SelectItem>
                                    <SelectItem value="xl">Extra Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>School Name (Override)</Label>
                            <Input value={config.header.headingText} onChange={(e) => updateSection('header', 'headingText', e.target.value)} placeholder="Leave blank to use default name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle (Address/Tagline)</Label>
                            <Input value={config.header.subtitle} onChange={(e) => updateSection('header', 'subtitle', e.target.value)} placeholder="E.g. Excellence in Education" />
                        </div>
                        <div className="space-y-2">
                            <Label>Affiliation Text</Label>
                            <Input value={config.header.affiliationText} onChange={(e) => updateSection('header', 'affiliationText', e.target.value)} placeholder="E.g. Affiliated to CBSE" />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-px bg-zinc-200 mx-4" />

                {/* PROFILE SETTINGS */}
                <AccordionItem value="profile" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-zinc-800">3. Profile Details</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                            <Label className="flex-1 cursor-pointer font-bold text-zinc-800">Show Student Photo</Label>
                            <Switch checked={config.profile.showPhoto} onCheckedChange={(v) => updateSection('profile', 'showPhoto', v)} />
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Dynamic Form Fields</p>
                            {config.profile.fields.map((field, idx) => (
                                <div key={field.key} className="flex items-center justify-between ml-2">
                                    <Label className="flex-1 cursor-pointer">{field.label}</Label>
                                    <Switch
                                        checked={field.isVisible}
                                        onCheckedChange={(v) => {
                                            const newFields = [...config.profile.fields];
                                            newFields[idx].isVisible = v;
                                            updateSection('profile', 'fields', newFields);
                                        }}
                                    />
                                </div>
                            ))}
                            <div className="text-[10px] text-zinc-400 mt-2 px-2 italic">
                                These fields are dynamically pulled from the student&apos;s admission form and profile.
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-px bg-zinc-200 mx-4" />

                {/* TABLE SETTINGS */}
                <AccordionItem value="table" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-zinc-800">4. Final Table Columns</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex-1 cursor-pointer">Show &quot;Min Marks&quot; Column</Label>
                            <Switch checked={config.table.showMinMarks} onCheckedChange={(v) => updateSection('table', 'showMinMarks', v)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="flex-1 cursor-pointer">Calculate & Show Grade</Label>
                            <Switch checked={config.table.showGrades} onCheckedChange={(v) => updateSection('table', 'showGrades', v)} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-px bg-zinc-200 mx-4" />

                {/* FOOTER SETTINGS */}
                <AccordionItem value="footer" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-zinc-800">5. Signatures</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="space-y-2">
                            <Label>Signature 1 Label</Label>
                            <Input value={config.footer.signature1Text} onChange={(e) => updateSection('footer', 'signature1Text', e.target.value)} placeholder="Leave blank to hide" />
                        </div>
                        <div className="space-y-2">
                            <Label>Signature 2 Label</Label>
                            <Input value={config.footer.signature2Text} onChange={(e) => updateSection('footer', 'signature2Text', e.target.value)} placeholder="Leave blank to hide" />
                        </div>
                        <div className="space-y-2">
                            <Label>Signature 3 Label</Label>
                            <Input value={config.footer.signature3Text} onChange={(e) => updateSection('footer', 'signature3Text', e.target.value)} placeholder="Leave blank to hide" />
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                            <Label className="flex-1 cursor-pointer">Print Date of Issue</Label>
                            <Switch checked={config.footer.showDate} onCheckedChange={(v) => updateSection('footer', 'showDate', v)} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div >
    );
}
