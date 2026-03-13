import { Metadata } from "next";
import { FeaturesClient } from "./features-client";

export const metadata: Metadata = {
    title: "Advanced School ERP Features | Admission, Fees, Attendance & Exams",
    description: "Explore the powerful features of Unifynt School Management Service. From automated fee collection to AI-based class schedules, we provide the ultimate digital core for institutions.",
    keywords: "school erp features, school management system modules, automated school billing, student attendance app, admission management software",
    openGraph: {
        title: "Explore 35+ Powerful School Management Features | Unifynt",
        description: "The most comprehensive ERP toolkit for modern schools. Everything you need to automate your institution.",
        images: ["/unifynt-logo.png"],
    }
};

export default function FeaturesPage() {
    return <FeaturesClient />;
}