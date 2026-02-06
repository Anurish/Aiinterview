import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ArrowRight,
  Sparkles,
  Mic,
  Code,
  BarChart3,
  FileText,
  Zap,
  Users,
  Star,
  Play,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Interviews",
    description: "Practice with voice mode using Web Speech API for realistic interview experience",
  },
  {
    icon: Code,
    title: "Code Editor",
    description: "Integrated Monaco editor for DSA and coding challenges",
  },
  {
    icon: BarChart3,
    title: "AI Grading",
    description: "Get scored on accuracy, clarity, confidence, and technical depth",
  },
  {
    icon: FileText,
    title: "Resume Mode",
    description: "Upload your resume for tailored interview questions",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Real-time streaming responses for immediate learning",
  },
  {
    icon: Users,
    title: "Role-Based Tracks",
    description: "Frontend, Next.js, MERN, Node.js, PHP, Laravel, DSA, and more",
  },
];

const stats = [
  { value: "10K+", label: "Interviews Completed" },
  { value: "95%", label: "User Satisfaction" },
  { value: "8", label: "Tech Tracks" },
  { value: "3", label: "Difficulty Levels" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300">AI-Powered Interview Practice</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-white">Master Technical</span>
              <br />
              <span className="gradient-text">Interviews with AI</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              Practice real technical interviews with AI. Get instant feedback,
              detailed reports, and personalized improvement roadmaps.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
              >
                Start Free Practice
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                <Play className="h-5 w-5" />
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Our platform offers comprehensive tools to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mb-4 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-colors">
                    <Icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Choose Your Track
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Specialized interview tracks for your career path
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Frontend", icon: "🎨" },
              { name: "Next.js", icon: "▲" },
              { name: "MERN Stack", icon: "🥞" },
              { name: "Node.js", icon: "🟢" },
              { name: "PHP", icon: "🐘" },
              { name: "Laravel", icon: "🔺" },
              { name: "DSA", icon: "🧮" },
              { name: "General SWE", icon: "💻" },
            ].map((track) => (
              <div
                key={track.name}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer"
              >
                <span className="text-2xl">{track.icon}</span>
                <span className="font-medium text-white">{track.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Loved by Developers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "This platform helped me land my dream job at a top tech company. The AI feedback is incredibly detailed!",
                author: "Sarah K.",
                role: "Frontend Developer",
              },
              {
                quote: "The voice interview mode made me much more confident. I felt fully prepared for my actual interview.",
                author: "Michael R.",
                role: "Full Stack Developer",
              },
              {
                quote: "The personalized roadmap feature helped me focus on exactly what I needed to improve. Highly recommend!",
                author: "Priya S.",
                role: "Software Engineer",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-purple-500/20 border border-violet-500/30 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Start practicing today with 3 free mock interviews
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <span className="font-bold text-white">InterviewAI</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 InterviewAI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
