import { LegalLayout } from "@/components/legal/legal-layout";

export default function CookiesPage() {
    return (
        <LegalLayout
            title="Cookie Policy"
            description="We use cookies to enhance your experience, analyze performance, and ensure the security of our platform."
            lastUpdated="March 13, 2026"
        >
            <section>
                <h2>1. What are Cookies?</h2>
                <p>
                    Cookies are small text files stored on your device when you visit a website. They help us recognize your browser and remember certain information to make your experience smoother.
                </p>
            </section>

            <section>
                <h2>2. Types of Cookies We Use</h2>
                <ul>
                    <li><strong>Essential Cookies:</strong> Necessary for the platform to function. These include authentication and security-related cookies.</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how users interact with our site by collecting anonymous analytics data.</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences, such as language settings and dashboard customizations.</li>
                    <li><strong>Analytics Cookies:</strong> Used to track platform performance and usage trends to help us deliver &quot;Smart Insights.&quot;</li>
                </ul>
            </section>

            <section>
                <h2>3. Why We Use Cookies</h2>
                <p>
                    We use cookies to:
                </p>
                <ul>
                    <li>Keep you signed in during your session.</li>
                    <li>Analyze how our features are being used to drive continuous improvement.</li>
                    <li>Provide fortified security by identifying potential threats and unauthorized access attempts.</li>
                <li>Optimize the rendering of advanced visuals and shaders on your device.</li>
                </ul>
            </section>

            <section>
                <h2>4. Managing Your Cookies</h2>
                <p>
                    Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that some features of the Unifynt Operating System may not function correctly without them.
                </p>
            </section>

            <section>
                <h2>5. Changes to This Policy</h2>
                <p>
                    We may update our Cookie Policy from time to time to reflect changes in technology or data protection regulations. We encourage you to visit this page periodically to stay informed.
                </p>
            </section>

            <section>
                <h2>6. Contact Us</h2>
                <p>
                    If you have questions about our use of cookies, please contact us at <a href="mailto:support@unifynt.com">support@unifynt.com</a>.
                </p>
            </section>
        </LegalLayout>
    );
}
