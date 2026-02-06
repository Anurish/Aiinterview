import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white/5 border border-white/10 shadow-2xl",
                        headerTitle: "text-white",
                        headerSubtitle: "text-gray-400",
                        socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
                        formFieldLabel: "text-gray-400",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        footerActionLink: "text-violet-400 hover:text-violet-300",
                        formButtonPrimary: "bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90",
                    },
                }}
            />
        </div>
    );
}
