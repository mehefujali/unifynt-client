import { LegalLayout } from "@/components/legal/legal-layout";

export default function PrivacyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            description="We are committed to protecting your personal data and your privacy. This policy outlines how we handle your information with transparency and security."
            lastUpdated="March 13, 2026"
        >
            <section>
                <h2>1. Information We Collect</h2>
                <p>
                    We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This may include:
                </p>
                <ul>
                    <li><strong>Contact Information:</strong> Name, email address, phone number, and institutional affiliation.</li>
                    <li><strong>Institutional Data:</strong> Student records, faculty details, and administrative information required for ERP operations.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including IP addresses, browser types, and access times.</li>
                </ul>
            </section>

            <section>
                <h2>2. How We Use Your Information</h2>
                <p>
                    Your data is used solely to provide, maintain, and improve the Unifynt Operating System. Specifically, we use it to:
                </p>
                <ul>
                    <li>Personalize your experience and provide relevant dashboards.</li>
                    <li>Process transactions and manage school-specific configurations.</li>
                    <li>Send technical notices, updates, and administrative messages.</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our Services.</li>
                </ul>
            </section>

            <section>
                <h2>3. Data Protection & Security</h2>
                <p>
                    We implement industry-standard security measures to protect your data. All sensitive information is encrypted using <strong>AES-256</strong> at rest and <strong>TLS/SSL</strong> during transit. We conduct regular security audits and vulnerability assessments to ensure the highest level of fortified security.
                </p>
            </section>

            <section>
                <h2>4. Sharing of Information</h2>
                <p>
                    We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our website or conducting our business, provided those parties agree to keep this information confidential.
                </p>
            </section>

            <section>
                <h2>5. Third-Party Services</h2>
                <p>
                    Our platform may integrate with third-party services like Razorpay for payments. These services have their own privacy policies, and we recommend that you review them before providing your data.
                </p>
            </section>

            <section>
                <h2>6. Your Data Rights</h2>
                <p>
                    You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact your institution&apos;s administrator or our support team directly.
                </p>
            </section>

            <section>
                <h2>7. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please reach out to us at <a href="mailto:privacy@unifynt.com">privacy@unifynt.com</a>.
                </p>
            </section>
        </LegalLayout>
    );
}
