/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { getEnterpriseTemplate } from "@/config/default-template";


export const dynamic = "force-dynamic";

interface PageProps {
    params: { subdomain: string };
}


async function getSchoolBySubdomain(subdomain: string) {
    try {

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

        const res = await fetch(`${apiUrl}/schools/public/${subdomain}`, {
            cache: "no-store",
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching school:", error);
        return null;
    }
}

export default async function SchoolLandingPage({ params }: PageProps) {

    const school = await getSchoolBySubdomain(params.subdomain);

    if (!school) return notFound();


    if (school.siteConfig?.gjsHtml) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: school.siteConfig.gjsCss || "" }} />
                <div dangerouslySetInnerHTML={{ __html: school.siteConfig.gjsHtml }} />
            </>
        );
    }


    const defaultHtml = getEnterpriseTemplate(school.name, school.logo || undefined);

    return (
        <div dangerouslySetInnerHTML={{ __html: defaultHtml }} />
    );
}