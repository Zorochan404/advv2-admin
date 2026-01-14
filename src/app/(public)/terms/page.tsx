import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | Adv Cars',
    description: 'Terms and conditions for using Adv Cars services.',
};

export default function TermsPage() {
    return (
        <div className="space-y-8 bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-sm border dark:border-zinc-800">
            <div className="border-b pb-4 dark:border-zinc-800">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Terms and Conditions</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">1. Introduction</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Welcome to Adv Cars. These Terms and Conditions govern your use of our website and services.
                        By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms,
                        then you may not access the service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">2. Use of Service</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        You must use our services only for lawful purposes. You may not use our services:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4 space-y-2">
                        <li>In any way that breaches any applicable local, national, or international law or regulation.</li>
                        <li>In any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect.</li>
                        <li>To transmit, or procure the sending of, any unsolicited or unauthorized advertising or promotional material.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">3. User Accounts</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">4. Intellectual Property</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Adv Cars and its licensors.
                        The Service is protected by copyright, trademark, and other laws.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">5. Limitation of Liability</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        In no event shall Adv Cars, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental,
                        special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                        resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">6. Changes</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide
                        at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">7. Contact Us</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        If you have any questions about these Terms, please contact us.
                    </p>
                </section>
            </div>
        </div>
    );
}
