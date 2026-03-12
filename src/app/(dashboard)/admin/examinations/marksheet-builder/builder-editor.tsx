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
            <Accordion type="single" collapsible className="w-full bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors" defaultValue="design">

                {/* DESIGN SETTINGS */}
                <AccordionItem value="design" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-black text-zinc-900 dark:text-zinc-100 py-5 uppercase tracking-tight text-[13px]">1. Global Design</AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2 pb-6 px-1">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Theme Color</Label>
                            <div className="flex gap-2.5 items-center">
                                <div className="relative group">
                                    <Input 
                                        type="color" 
                                        className="w-12 h-11 p-1 cursor-pointer rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all group-hover:ring-2 group-hover:ring-zinc-100 dark:group-hover:ring-zinc-800" 
                                        value={config.design.themeColor} 
                                        onChange={(e) => updateSection('design', 'themeColor', e.target.value)} 
                                    />
                                </div>
                                <Input 
                                    type="text" 
                                    className="uppercase font-black text-[12px] h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all" 
                                    value={config.design.themeColor} 
                                    onChange={(e) => updateSection('design', 'themeColor', e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="space-y-4 border-t pt-5 border-zinc-100 dark:border-zinc-800/50">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Background Watermark</Label>
                            <RadioGroup
                                value={config.design.watermarkType}
                                onValueChange={(v) => updateSection('design', 'watermarkType', v as "image" | "text" | "none")}
                                className="grid gap-2.5"
                            >
                                <label htmlFor="wm-img" className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all">
                                    <RadioGroupItem value="image" id="wm-img" className="text-zinc-900 dark:text-zinc-100" />
                                    <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">School Logo (Center)</span>
                                </label>
                                <label htmlFor="wm-txt" className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all">
                                    <RadioGroupItem value="text" id="wm-txt" className="text-zinc-900 dark:text-zinc-100" />
                                    <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">Custom Text Overlay</span>
                                </label>
                                <label htmlFor="wm-none" className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all">
                                    <RadioGroupItem value="none" id="wm-none" className="text-zinc-900 dark:text-zinc-100" />
                                    <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">Hidden (None)</span>
                                </label>
                            </RadioGroup>

                            {config.design.watermarkType === "text" && (
                                <div className="space-y-2 mt-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Label Text</Label>
                                    <Input 
                                        className="h-10 rounded-lg text-[12px] font-medium" 
                                        value={config.design.customWatermarkText} 
                                        onChange={(e) => updateSection('design', 'customWatermarkText', e.target.value)} 
                                    />
                                </div>
                            )}

                            {config.design.watermarkType !== "none" && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Opacity: {config.design.watermarkOpacity}%</Label>
                                    </div>
                                    <div className="px-1">
                                        <input
                                            type="range"
                                            min={1}
                                            max={20}
                                            step={1}
                                            value={config.design.watermarkOpacity}
                                            onChange={(e) => updateSection('design', 'watermarkOpacity', parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800/60 mx-6" />

                {/* HEADER SETTINGS */}
                <AccordionItem value="header" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-black text-zinc-900 dark:text-zinc-100 py-5 uppercase tracking-tight text-[13px]">2. Header Details</AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2 pb-6 px-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                            <Label className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Official School Logo</Label>
                            <Switch checked={config.header.showLogo} onCheckedChange={(v) => updateSection('header', 'showLogo', v)} />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Title Font Size</Label>
                            <Select value={config.header.titleSize} onValueChange={(v) => updateSection('header', 'titleSize', v as "sm" | "md" | "lg" | "xl")}>
                                <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                    <SelectItem value="sm" className="font-bold">Small (2xl)</SelectItem>
                                    <SelectItem value="md" className="font-bold">Medium (3xl)</SelectItem>
                                    <SelectItem value="lg" className="font-bold">Large (4xl)</SelectItem>
                                    <SelectItem value="xl" className="font-bold">Extra Large (5xl)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Custom Heading (Optional)</Label>
                            <Input 
                                value={config.header.headingText} 
                                onChange={(e) => updateSection('header', 'headingText', e.target.value)} 
                                placeholder="Default School Name"
                                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Tagline or Address</Label>
                            <Input 
                                value={config.header.subtitle} 
                                onChange={(e) => updateSection('header', 'subtitle', e.target.value)} 
                                placeholder="e.g. Excellence in Education"
                                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Affiliation Status</Label>
                            <Input 
                                value={config.header.affiliationText} 
                                onChange={(e) => updateSection('header', 'affiliationText', e.target.value)} 
                                placeholder="e.g. Affiliated to CBSE"
                                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400"
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800/60 mx-6" />

                {/* PROFILE SETTINGS */}
                <AccordionItem value="profile" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-black text-zinc-900 dark:text-zinc-100 py-5 uppercase tracking-tight text-[13px]">3. Profile Attributes</AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2 pb-6 px-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 mb-3">
                            <Label className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Official Student Portrait</Label>
                            <Switch checked={config.profile.showPhoto} onCheckedChange={(v) => updateSection('profile', 'showPhoto', v)} />
                        </div>

                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 pl-1">Data Visibility Controls</p>
                            <div className="grid gap-2">
                                {config.profile.fields.map((field, idx) => (
                                    <div key={field.key} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/20 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                                        <Label className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">{field.label}</Label>
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
                            </div>
                            <div className="text-[10px] font-medium text-zinc-400 mt-4 px-2 italic leading-relaxed text-center opacity-70">
                                Protected fields are automatically synchronized from the SIS database.
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800/60 mx-6" />

                {/* TABLE SETTINGS */}
                <AccordionItem value="table" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-black text-zinc-900 dark:text-zinc-100 py-5 uppercase tracking-tight text-[13px]">4. Registry Table</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2 pb-6 px-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                            <Label className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Show Min Marks Column</Label>
                            <Switch checked={config.table.showMinMarks} onCheckedChange={(v) => updateSection('table', 'showMinMarks', v)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40">
                            <Label className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Auto-calculate Grade Points</Label>
                            <Switch checked={config.table.showGrades} onCheckedChange={(v) => updateSection('table', 'showGrades', v)} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800/60 mx-6" />

                {/* FOOTER SETTINGS */}
                <AccordionItem value="footer" className="border-b-0 px-4">
                    <AccordionTrigger className="hover:no-underline font-black text-zinc-900 dark:text-zinc-100 py-5 uppercase tracking-tight text-[13px]">5. Authentication</AccordionTrigger>
                    <AccordionContent className="space-y-5 pt-2 pb-6 px-1">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Primary Authority (Left)</Label>
                                <Input value={config.footer.signature1Text} onChange={(e) => updateSection('footer', 'signature1Text', e.target.value)} placeholder="e.g. Class Teacher" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Control Authority (Center)</Label>
                                <Input value={config.footer.signature2Text} onChange={(e) => updateSection('footer', 'signature2Text', e.target.value)} placeholder="e.g. Exam Controller" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-1">Final Authority (Right)</Label>
                                <Input value={config.footer.signature3Text} onChange={(e) => updateSection('footer', 'signature3Text', e.target.value)} placeholder="e.g. Principal" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium placeholder:text-zinc-400" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 mt-3">
                            <Label className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">Official Issue Timestamp</Label>
                            <Switch checked={config.footer.showDate} onCheckedChange={(v) => updateSection('footer', 'showDate', v)} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
