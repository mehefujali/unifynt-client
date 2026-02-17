export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
            <div className="w-full  space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                        >
                            <path d="M22 10v6M2 10v6" />
                            <path d="M2 10l10-5 10 5-10 5z" />
                            <path d="M12 15v6" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Unifynt ERP</h1>
                </div>
                {children}
            </div>
        </div>
    );
}