"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Building2, Calendar, CreditCard, Mail, MapPin, Phone, UserCircle } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ViewStaffModal({ staff, open, onClose }: { staff: any; open: boolean; onClose: () => void }) {
    if (!staff) return null;

    const fullName = `${staff.firstName} ${staff.lastName}`;
    const initials = `${staff.firstName?.charAt(0) || ""}${staff.lastName?.charAt(0) || ""}`;
    const role = staff.user?.role || (staff.isTeacher ? "TEACHER" : "STAFF");
    const status = staff.user?.status || staff.status;

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-full sm:max-w-md xl:max-w-lg p-0 bg-background border-l-0 sm:border-l flex flex-col h-full shadow-2xl">
                <SheetHeader className="sr-only">
                    <SheetTitle>Staff Details: {fullName}</SheetTitle>
                </SheetHeader>

                {/* 🔴 Scrollable Area Start (Perfectly constrained within the screen) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                    
                    {/* Hero / Cover Section */}
                    <div className="h-32 sm:h-36 bg-primary/10 relative shrink-0">
                        <div className="absolute -bottom-10 left-6 sm:left-8">
                            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg ring-1 ring-border/20">
                                <AvatarImage src={staff.profileImage} alt={fullName} />
                                <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl uppercase">
                                    {initials || <UserCircle className="h-10 w-10 sm:h-12 sm:w-12" />}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute top-4 right-12 flex gap-2">
                            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary shadow-sm">
                                {role.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={`bg-background/80 backdrop-blur-sm font-black text-[10px] uppercase tracking-widest border-none shadow-sm ${status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"}`}>
                                {status}
                            </Badge>
                        </div>
                    </div>

                    {/* Main Content Details */}
                    <div className="pt-16 pb-10 px-6 sm:px-8 space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight leading-none">{fullName}</h2>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">
                                    ID: {staff.employeeId}
                                </span>
                                {staff.designation && (
                                    <span className="text-[13px] font-bold text-primary">{staff.designation}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3.5 p-3.5 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/40">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Email Address</p>
                                    <p className="text-[13px] sm:text-sm font-semibold text-foreground truncate">{staff.user?.email || staff.email || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/40">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Phone Number</p>
                                    <p className="text-[13px] sm:text-sm font-semibold text-foreground">{staff.phone || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/40">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Department</p>
                                    <p className="text-[13px] sm:text-sm font-semibold text-foreground">{staff.department || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/40">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Address</p>
                                    <p className="text-[13px] sm:text-sm font-semibold text-foreground leading-relaxed">{staff.address || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 p-3.5 bg-muted/20 rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Date of Birth</p>
                                </div>
                                <p className="text-[13px] sm:text-sm font-semibold text-foreground mt-1">{staff.dateOfBirth ? format(new Date(staff.dateOfBirth), "dd MMM yyyy") : "N/A"}</p>
                            </div>
                            <div className="flex flex-col gap-1.5 p-3.5 bg-muted/20 rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Joining Date</p>
                                </div>
                                <p className="text-[13px] sm:text-sm font-semibold text-foreground mt-1">{staff.joiningDate ? format(new Date(staff.joiningDate), "dd MMM yyyy") : "N/A"}</p>
                            </div>
                            <div className="flex flex-col gap-1.5 p-3.5 bg-muted/20 rounded-xl border border-border/50 col-span-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <UserCircle className="h-4 w-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Gender</p>
                                </div>
                                <p className="text-[13px] sm:text-sm font-semibold text-foreground mt-1">{staff.gender || "N/A"}</p>
                            </div>
                        </div>

                        <Separator className="bg-border/60" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="text-[13px] font-black uppercase tracking-widest text-foreground">Financial Details</h3>
                            </div>
                            <div className="flex flex-col gap-4 p-5 sm:p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                                    <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Basic Salary</p>
                                    <p className="font-mono font-black text-primary text-xl sm:text-2xl">₹{staff.basicSalary?.toLocaleString() || "0"}</p>
                                </div>
                                <div className="space-y-4 pt-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bank Name</p>
                                        <p className="font-semibold text-[13px] sm:text-sm">{staff.bankName || "N/A"}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Account No</p>
                                        <p className="font-mono font-semibold text-[13px] sm:text-sm">{staff.accountNumber || "N/A"}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">IFSC Code</p>
                                        <p className="font-mono font-semibold text-[13px] sm:text-sm uppercase">{staff.ifscCode || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                {/* 🔴 Scrollable Area End */}
                
            </SheetContent>
        </Sheet>
    );
}