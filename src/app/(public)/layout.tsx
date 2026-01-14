export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {children}
            </main>
        </div>
    );
}
