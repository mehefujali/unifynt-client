/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function ViewSlipModal({ slip, open, onClose }: { slip: any, open: boolean, onClose: () => void }) {
    if (!slip) return null;

    const employee = slip.teacher || slip.staff;
    const allowances = Array.isArray(slip.allowances) ? slip.allowances : [];
    const deductions = Array.isArray(slip.deductions) ? slip.deductions : [];

    const totalAllowances = allowances.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalDeductions = deductions.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const grossEarnings = slip.basicPay + totalAllowances;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[700px] p-0 bg-background shadow-2xl">
                {/* Header Section */}
                <DialogHeader className="p-6 bg-muted/20 border-b text-center">
                    <DialogTitle className="text-2xl font-black uppercase tracking-widest text-primary">Salary Slip</DialogTitle>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                        {MONTHS[slip.month - 1]} {slip.year}
                    </p>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Employee Details Grid */}
                    <div className="bg-muted/10 p-5 rounded-xl border grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Employee Name</p>
                            <p className="font-bold text-base">{employee?.firstName} {employee?.lastName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Employee ID</p>
                            <p className="font-bold font-mono text-base">{employee?.employeeId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Role / Type</p>
                            <p className="font-bold text-base text-primary uppercase">{slip.teacher ? "Teacher" : "Staff"}</p>
                        </div>
                        {/* More bank details... */}
                    </div>

                    <div className="border rounded-xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-2 bg-muted/30">
                            {/* Earnings Column */}
                            <div className="p-5 border-r">
                                <h4 className="font-extrabold uppercase tracking-wider text-xs mb-4 text-emerald-600">Earnings</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between font-medium"><span>Basic Pay</span><span>₹{slip.basicPay?.toLocaleString()}</span></div>
                                    {allowances.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-muted-foreground"><span>{item.title}</span><span>₹{Number(item.amount).toLocaleString()}</span></div>
                                    ))}
                                </div>
                                <Separator className="my-4 border-emerald-500/20" />
                                <div className="flex justify-between font-bold text-sm"><span>Gross Earnings</span><span>₹{grossEarnings.toLocaleString()}</span></div>
                            </div>

                            {/* Deductions Column */}
                            <div className="p-5">
                                <h4 className="font-extrabold uppercase tracking-wider text-xs mb-4 text-destructive">Deductions</h4>
                                <div className="space-y-3 text-sm">
                                    {deductions.length > 0 ? deductions.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-muted-foreground"><span>{item.title}</span><span>₹{Number(item.amount).toLocaleString()}</span></div>
                                    )) : (
                                        <div className="text-muted-foreground italic">No deductions</div>
                                    )}
                                </div>
                                <Separator className="my-4 border-destructive/20" />
                                <div className="flex justify-between font-bold text-sm"><span>Total Deductions</span><span className="text-destructive">₹{totalDeductions.toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* Net Salary Row */}
                        <div className="bg-primary p-5 text-primary-foreground flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">Net Salary Payable</h3>
                                <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Status: {slip.status}</p>
                            </div>
                            <h2 className="text-3xl font-black font-mono">₹{slip.netSalary.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}