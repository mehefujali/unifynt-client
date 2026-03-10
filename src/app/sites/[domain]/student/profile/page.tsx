/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Droplet,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully!");
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password. Please verify your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const details = user.details || {};
  const studentDetails = user.studentDetails || {};

  const profileImage = details.profilePicture || details.profileImage || (user as any).avatar || "";
  const displayName = details.firstName ? `${details.firstName} ${details.lastName || ""}`.trim() : user.name || "Student";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

  const formattedDOB = details.dateOfBirth ? format(new Date(details.dateOfBirth), "MMMM do, yyyy") : "Not provided";

  // Custom Detail Row
  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800/60 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[13px] font-bold text-zinc-500">{label}</span>
      </div>
      <span className="text-[14px] font-black text-zinc-900 dark:text-zinc-100text-right max-w-[50%] truncate">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8 pb-10">

      {/* Page Header */}
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          My Profile
        </h1>
        <p className="text-sm font-medium text-zinc-500">Manage your persona settings and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

        {/* Left Column: Personal Read-only Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Identity Card Component */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[var(--primary)]/20 to-transparent pointer-events-none" />

            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-4 border-white dark:border-zinc-950 shadow-xl z-10 transition-transform hover:scale-105">
              <AvatarImage src={profileImage} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] text-white text-3xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{displayName}</h2>
              <p className="text-zinc-500 font-bold mt-1 uppercase tracking-widest text-[11px] bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                Student {studentDetails.rollNumber ? `• Roll: ${studentDetails.rollNumber}` : ""}
              </p>

              <div className="flex items-center gap-4 mt-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
              </div>
            </div>
          </div>

          {/* Detailed Read-Only Data */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <h3 className="text-[15px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Phone Number" value={details.contactNumber || details.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={formattedDOB} />
              <InfoRow icon={User} label="Gender" value={details.gender} />
              <InfoRow icon={Droplet} label="Blood Group" value={details.bloodGroup} />
              <div className="sm:col-span-2">
                <InfoRow icon={MapPin} label="Home Address" value={details.presentAddress || details.address} />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-2xl border border-amber-100 dark:border-amber-500/20">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <p className="text-[12px] font-bold">
                Your profile information is restricted. To update these details, please contact the school administration.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Password Change */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[32px] p-6 shadow-sm sticky top-24">
            <h3 className="text-[15px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security
            </h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Current Password</Label>
                <div className="relative">
                  <Input
                    {...form.register("oldPassword")}
                    type={showOldPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium"
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.oldPassword && <p className="text-[11px] text-rose-500 font-bold">{form.formState.errors.oldPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">New Password</Label>
                <div className="relative">
                  <Input
                    {...form.register("newPassword")}
                    type={showNewPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium"
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.newPassword && <p className="text-[11px] text-rose-500 font-bold">{form.formState.errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    {...form.register("confirmPassword")}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium"
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && <p className="text-[11px] text-rose-500 font-bold">{form.formState.errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-4 text-[13px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-transform"
                disabled={isLoading}
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : <><Save className="mr-2 h-4 w-4" /> Update Password</>}
              </Button>
            </form>

            <div className="mt-6 flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                Your password must be at least 6 characters long. For security reasons, you will need to log back in after changing your password.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
