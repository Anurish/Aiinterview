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
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Interviews",
    description: "Practice with voice mode for realistic interview experience",
  },
  {
    icon: Code,
    title: "Code Editor",
    description: "Integrated Monaco editor for DSA and coding challenges",
  },
  {
    icon: BarChart3,
    title: "AI Grading",
    description: "Get scored on accuracy, clarity, confidence, and depth",
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
    description: "Frontend, Next.js, MERN, Node.js, PHP, Laravel & more",
  },
];

const stats = [
  { value: "10K+", label: "Interviews" },
  { value: "95%", label: "Satisfaction" },
  { value: "8", label: "Tech Tracks" },
  { value: "3", label: "Levels" },
];

const tracks = [
  { name: "Frontend", icon: "🎨", color: "from-pink-500/20 to-rose-500/20" },
  { name: "Next.js", icon: "▲", color: "from-gray-500/20 to-slate-500/20" },
  { name: "MERN", icon: "🥞", color: "from-green-500/20 to-emerald-500/20" },
  { name: "Node.js", icon: "🟢", color: "from-lime-500/20 to-green-500/20" },
  { name: "PHP", icon: "🐘", color: "from-indigo-500/20 to-blue-500/20" },
  { name: "Laravel", icon: "🔺", color: "from-red-500/20 to-orange-500/20" },
  { name: "DSA", icon: "🧮", color: "from-yellow-500/20 to-amber-500/20" },
  { name: "General", icon: "💻", color: "from-violet-500/20 to-purple-500/20" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 sm:pb-32 overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-glow animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6 sm:mb-8 animate-slide-up">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-xs sm:text-sm text-violet-300">AI-Powered Interview Practice</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up stagger-1">
              <span className="text-white">Master Technical</span>
              <br />
              <span className="gradient-text">Interviews with AI</span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4 animate-slide-up stagger-2">
              Practice real technical interviews with AI. Get instant feedback,
              detailed reports, and personalized improvement roadmaps.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 animate-slide-up stagger-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all active:scale-95"
              >
                Start Free Practice
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all active:scale-95"
              >
                <Play className="h-5 w-5" />
                View Pricing
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4 animate-slide-up stagger-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Everything You Need to Succeed
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-400 px-4">
              Comprehensive tools to help you ace your interview
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mb-3 sm:mb-4 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-colors">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Choose Your Track
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-400">
              Specialized tracks for your career path
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {tracks.map((track, index) => (
              <div
                key={track.name}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br ${track.color} border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer hover:scale-105 active:scale-95`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-xl sm:text-2xl">{track.icon}</span>
                <span className="font-medium text-sm sm:text-base text-white">{track.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-400">
              Get started in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "1", title: "Choose Track", desc: "Select your tech stack and difficulty level" },
              { step: "2", title: "Practice Interview", desc: "Answer AI-generated questions via text or voice" },
              { step: "3", title: "Get Report", desc: "Receive detailed feedback and improvement roadmap" },
            ].map((item, index) => (
              <div key={item.step} className="text-center p-6 sm:p-8">
                <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Loved by Developers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                quote: "This platform helped me land my dream job at a top tech company!",
                author: "Sarah K.",
                role: "Frontend Developer",
              },
              {
                quote: "The voice interview mode made me much more confident.",
                author: "Michael R.",
                role: "Full Stack Developer",
              },
              {
                quote: "The personalized roadmap helped me focus on what matters.",
                author: "Priya S.",
                role: "Software Engineer",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="font-medium text-white text-sm sm:text-base">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-purple-500/20 border border-violet-500/30 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-sm sm:text-lg text-gray-300 mb-6 sm:mb-8">
                Start practicing today with 3 free mock interviews
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all active:scale-95"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  3 free interviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <span className="font-bold text-white">InterviewAI</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              © 2024 InterviewAI. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
