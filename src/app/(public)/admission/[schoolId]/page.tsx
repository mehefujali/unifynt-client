import { notFound } from "next/navigation";
import { AdmissionService } from "@/services/admission.service";
import DynamicAdmissionForm from "@/components/admission/DynamicAdmissionForm";


export default async function AdmissionPage({ params }: { params: { schoolId: string } }) {
    let config;

    try {

        const res = await AdmissionService.getPublicConfig(params.schoolId);
        config = res.data;
    } catch (error) {

        return notFound();
    }

    if (!config?.isActive) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Admission Closed</h1>
                    <p className="text-gray-600">
                        The admission process for this school is currently not active. Please contact the administration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                <DynamicAdmissionForm schoolId={params.schoolId} config={config} />
            </div>
        </div>
    );
}