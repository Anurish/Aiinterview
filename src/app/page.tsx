import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { HeroBackground } from "@/components/HeroBackground";
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
    <div className="min-h-screen bg-transparent overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      <HeroBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-scale">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-200">AI-Powered Interview Practice</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
              <span className="block text-white animate-slide-up stagger-1 drop-shadow-lg">Master Technical</span>
              <span className="block gradient-text animate-slide-up stagger-2 drop-shadow-lg pb-2">Interviews with AI</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto px-4 animate-slide-up stagger-3 leading-relaxed drop-shadow-md">
              Practice real technical interviews with our advanced AI. Get <span className="text-violet-400 font-medium">instant feedback</span>,
              detailed reports, and personalized improvement roadmaps.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-4">
              <Link
                href="/dashboard"
                className="group relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 transition-all shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.6)] hover:-translate-y-1"
              >
                Start Free Practice
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
              >
                <Play className="h-5 w-5 fill-white" />
                See How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up stagger-5 border-t border-white/10 pt-10">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Soft gradient overlay at bottom to blend into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden backdrop-blur-sm bg-black/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our platform interacts with you just like a real interviewer would.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card group p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-500/10 text-violet-400 mb-6 group-hover:scale-110 group-hover:bg-violet-500/20 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-24 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Track
            </h2>
            <p className="text-lg text-gray-400">
              Specialized interview paths for every stack
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tracks.map((track, index) => (
              <div
                key={track.name}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${track.color} border border-white/5 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{track.icon}</div>
                <div className="font-bold text-white text-lg">{track.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            {[
              { step: "1", title: "Select Track", desc: "Choose your tech stack and experience level" },
              { step: "2", title: "Interview", desc: "Interact with our AI via voice or text in real-time" },
              { step: "3", title: "Get Feedback", desc: "Detailed analysis of your answers and code" },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-violet-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative w-24 h-24 rounded-full bg-black border-2 border-violet-500/30 group-hover:border-violet-500 flex items-center justify-center z-10 transition-colors duration-300">
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-lg max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by Developers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="glass-card p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                  ))}
                </div>
                <p className="text-lg text-gray-300 mb-6 italic leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{testimonial.author}</p>
                    <p className="text-sm text-violet-300">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] overflow-hidden text-center bg-violet-900/10 border border-violet-500/20 backdrop-blur-sm">
            {/* Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-violet-200 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of developers who are landing their dream jobs with InterviewAI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-violet-900 font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Get Started Free
              </Link>
              <div className="px-6 py-4 flex items-center gap-2 text-violet-200">
                <CheckCircle className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">InterviewAI</span>
          </div>

          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} InterviewAI. All rights reserved.
          </div>

          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
