"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"; // DND Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdmissionService } from "@/services/admission.service";

type FieldType = "TEXT" | "NUMBER" | "TEXTAREA" | "DROPDOWN" | "DATE" | "FILE";

interface IFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required: boolean;
    options?: string[];
}

interface IFormConfig {
    isActive: boolean;
    fields: IFieldConfig[];
}

export default function AdmissionSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const { control, register, handleSubmit, reset, watch, setValue } = useForm<IFormConfig>({
        defaultValues: {
            isActive: true,
            fields: [],
        },
    });

    // 'move' ফাংশনটি ড্র্যাগ করার পর পজিশন চেঞ্জ করতে সাহায্য করবে
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "fields",
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await AdmissionService.getMySchoolConfig();
                if (res.data) {
                    reset({
                        isActive: res.data.isActive,
                        fields: Array.isArray(res.data.fields) ? res.data.fields : [],
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setFetching(false);
            }
        };
        fetchConfig();
    }, [reset]);

    // ড্র্যাগ শেষ হলে এই ফাংশনটি কল হবে
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        move(result.source.index, result.destination.index);
    };

    const onSubmit = async (data: IFormConfig) => {
        try {
            setLoading(true);

            const formattedFields = data.fields.map((field) => ({
                ...field,
                name: field.label.toLowerCase().replace(/\s+/g, "_"),
                options: typeof field.options === "string"
                    ? (field.options as string).split(",").map((opt: string) => opt.trim())
                    : field.options,
            }));

            await AdmissionService.updateConfig({
                isActive: data.isActive,
                fields: formattedFields,
            });

            toast.success("Admission configuration updated successfully");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || "Failed to update configuration");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admission Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your school&apos;s online admission form fields and visibility.
                    </p>
                </div>
                <Button onClick={handleSubmit(onSubmit)} disabled={loading} size="lg">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Separator />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Control the visibility of the admission portal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4 border p-4 rounded-lg bg-secondary/10">
                            <Controller
                                control={control}
                                name="isActive"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <div>
                                <Label className="text-base font-semibold">Enable Online Admission</Label>
                                <p className="text-sm text-muted-foreground">
                                    Turn this off to temporarily disable new applications.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Form Builder</CardTitle>
                            <CardDescription>
                                Drag and drop items to reorder.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                append({
                                    name: "",
                                    label: "",
                                    type: "TEXT",
                                    required: true,
                                    placeholder: "",
                                    options: [],
                                })
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Field
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Drag and Drop Context */}
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="form-fields">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        {fields.length === 0 && (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                                                No custom fields added yet. Click &quot;Add New Field&quot; to start.
                                            </div>
                                        )}

                                        {fields.map((field, index) => (
                                            <Draggable key={field.id} draggableId={field.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card transition-all ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary scale-[1.02] z-50" : "hover:shadow-sm"
                                                            }`}
                                                        style={provided.draggableProps.style}
                                                    >
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="col-span-1 flex justify-center pt-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary"
                                                        >
                                                            <GripVertical className="h-5 w-5" />
                                                        </div>

                                                        <div className="col-span-3 space-y-2">
                                                            <Label>Field Label <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                {...register(`fields.${index}.label`, { required: true })}
                                                                placeholder="e.g. Father's Name"
                                                            />
                                                        </div>

                                                        <div className="col-span-3 space-y-2">
                                                            <Label>Field Type</Label>
                                                            <Controller
                                                                control={control}
                                                                name={`fields.${index}.type`}
                                                                render={({ field }) => (
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="TEXT">Text Input</SelectItem>
                                                                            <SelectItem value="NUMBER">Number</SelectItem>
                                                                            <SelectItem value="TEXTAREA">Long Text</SelectItem>
                                                                            <SelectItem value="DROPDOWN">Dropdown List</SelectItem>
                                                                            <SelectItem value="DATE">Date Picker</SelectItem>
                                                                            <SelectItem value="FILE">File Upload</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col-span-3 space-y-2">
                                                            {watch(`fields.${index}.type`) === "DROPDOWN" ? (
                                                                <>
                                                                    <Label>Options (comma separated)</Label>
                                                                    <Input
                                                                        {...register(`fields.${index}.options`)}
                                                                        placeholder="Male, Female, Other"
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Label>Placeholder</Label>
                                                                    <Input
                                                                        {...register(`fields.${index}.placeholder`)}
                                                                        placeholder="e.g. Enter value..."
                                                                    />
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="col-span-1 space-y-2 text-center">
                                                            <Label>Required</Label>
                                                            <div className="flex justify-center pt-2">
                                                                <Controller
                                                                    control={control}
                                                                    name={`fields.${index}.required`}
                                                                    render={({ field }) => (
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1 text-right pt-6">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => remove(index)}
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}