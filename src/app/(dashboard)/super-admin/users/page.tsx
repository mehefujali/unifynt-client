"use client"

import ManageUsers from "@/components/dashboard/super-admin/manage-users";

export default function SuperAdminUsersPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
            </div>
            <ManageUsers />
        </div>
    )
}
