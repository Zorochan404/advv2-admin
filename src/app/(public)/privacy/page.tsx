import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Adv Cars',
    description: 'Privacy policy for Adv Cars services.',
};

export default function PrivacyPage() {
    return (
        <div className="space-y-8 bg-white dark:bg-zinc-950 p-8 rounded-lg shadow-sm border dark:border-zinc-800">
            <div className="border-b pb-4 dark:border-zinc-800">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Privacy Policy</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">1. Introduction</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Adv Cars ("us", "we", or "our") operates this website (the "Service").
                        This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service
                        and the choices you have associated with that data.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">2. Information Collection and Use</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        We collect several different types of information for various purposes to provide and improve our Service to you.
                    </p>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Types of Data Collected</h3>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Personal Data</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                        While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data").
                        Personally identifiable information may include, but is not limited to:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4 space-y-2">
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Cookies and Usage Data</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">3. Use of Data</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Adv Cars uses the collected data for various purposes:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4 space-y-2">
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">4. Transfer of Data</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country
                        or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">5. Disclosure of Data</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Adv Cars may disclose your Personal Data in the good faith belief that such action is necessary to:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4 space-y-2">
                        <li>To comply with a legal obligation</li>
                        <li>To protect and defend the rights or property of Adv Cars</li>
                        <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>To protect the personal safety of users of the Service or the public</li>
                        <li>To protect against legal liability</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">6. Security of Data</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
                        While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>
            </div>
        </div>
    );
}
