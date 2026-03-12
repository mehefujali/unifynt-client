import { LegalLayout } from "@/components/legal/legal-layout";

export default function TermsPage() {
    return (
        <LegalLayout
            title="Terms of Service"
            description="Our terms are designed to create a secure, fair, and efficient environment for educational institutions worldwide."
            lastUpdated="March 13, 2026"
        >
            <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Unifynt Operating System, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
                </p>
            </section>

            <section>
                <h2>2. License &amp; Access</h2>
                <p>
                    Unifynt grants you a limited, non-exclusive, non-transferable license to access and use the platform for the internal administrative and educational purposes of your institution.
                </p>
            </section>

            <section>
                <h2>3. User Account Responsibilities</h2>
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
            </section>

            <section>
                <h2>4. Prohibited Conduct</h2>
                <p>
                    Users are prohibited from:
                </p>
                <ul>
                    <li>Attempting to breach the platform&apos;s fortified security measures.</li>
                    <li>Using the services for any illegal purpose or in violation of local laws.</li>
                    <li>Reverse engineering, decompiling, or attempting to extract the source code of the platform.</li>
                    <li>Uploading malicious software or interfering with the system uptime.</li>
                </ul>
            </section>

            <section>
                <h2>5. Intellectual Property</h2>
                <p>
                    All content, features, and functionality of the Unifynt Operating System—including branding, shaders, and UI designs—are the exclusive property of Unifynt and are protected by international copyright and trademark laws.
                </p>
            </section>

            <section>
                <h2>6. Termination</h2>
                <p>
                    We reserve the right to terminate or suspend your access to the platform without prior notice if you violate these terms or engage in conduct that we deem harmful to other users or our business interests.
                </p>
            </section>

            <section>
                <h2>7. Limitation of Liability</h2>
                <p>
                    Unifynt shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services, even if we have been advised of the possibility of such damages.
                </p>
            </section>

            <section>
                <h2>8. Governing Law</h2>
                <p>
                    These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which Unifynt is registered, without regard to its conflict of law principles.
                </p>
            </section>
        </LegalLayout>
    );
}
