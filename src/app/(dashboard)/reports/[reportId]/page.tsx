import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportCard } from "@/components/ReportCard";
import { ProgressChart } from "@/components/ProgressChart";
import { formatDate, getTrackLabel, getDifficultyColor } from "@/lib/utils";
import { ArrowLeft, Download, Share2, Calendar, MessageSquare } from "lucide-react";
import { generateReport, type Track, type Difficulty } from "@/lib/ai";

interface ReportPageProps {
    params: Promise<{ reportId: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
    const authSession = await auth();
    if (!authSession?.user?.id) return notFound();

    const { reportId } = await params;

    const interviewSession = await prisma.interviewSession.findUnique({
        where: { id: reportId },
        include: {
            user: true,
            questions: {
                include: {
                    response: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
            report: true,
        },
    });

    if (!interviewSession || interviewSession.user.id !== authSession.user.id) {
        return notFound();
    }

    // Generate report if not exists
    let report = interviewSession.report;
    if (!report && interviewSession.status === "COMPLETED") {
        const reportData = await generateReport({
            track: interviewSession.track as Track,
            difficulty: interviewSession.difficulty as Difficulty,
            questions: interviewSession.questions.map((q: { content: string; response: { answer: string; overallScore: number | null; feedback: string | null } | null }) => ({
                content: q.content,
                response: q.response
                    ? {
                        answer: q.response.answer,
                        overallScore: q.response.overallScore || undefined,
                        feedback: q.response.feedback || undefined,
                    }
                    : undefined,
            })),
        });

        report = await prisma.report.create({
            data: {
                sessionId: interviewSession.id,
                overallScore: reportData.overallScore,
                strengths: JSON.stringify(reportData.strengths),
                weaknesses: JSON.stringify(reportData.weaknesses),
                recommendations: JSON.stringify(reportData.recommendations),
                roadmap: JSON.stringify(reportData.roadmap),
            },
        });
    }

    // Calculate average scores
    type ResponseType = { accuracy: number | null; clarity: number | null; confidence: number | null; technicalDepth: number | null; overallScore: number | null } | null;
    const responses = interviewSession.questions.map((q: { response: ResponseType }) => q.response).filter(Boolean) as NonNullable<ResponseType>[];

    // Calculate individual metric averages
    const avgAccuracy = responses.length > 0
        ? responses.reduce((acc: number, r) => acc + (r?.accuracy || 0), 0) / responses.length
        : 0;
    const avgClarity = responses.length > 0
        ? responses.reduce((acc: number, r) => acc + (r?.clarity || 0), 0) / responses.length
        : 0;
    const avgConfidence = responses.length > 0
        ? responses.reduce((acc: number, r) => acc + (r?.confidence || 0), 0) / responses.length
        : 0;
    const avgTechnicalDepth = responses.length > 0
        ? responses.reduce((acc: number, r) => acc + (r?.technicalDepth || 0), 0) / responses.length
        : 0;

    // Calculate overall score using weighted average of individual metrics
    // This is more reliable than using the stored overallScore which may not be parsed correctly
    const calculatedOverall = (avgAccuracy * 0.35) + (avgClarity * 0.25) + (avgConfidence * 0.15) + (avgTechnicalDepth * 0.25);

    const avgScores = {
        accuracy: avgAccuracy,
        clarity: avgClarity,
        confidence: avgConfidence,
        technicalDepth: avgTechnicalDepth,
        overall: calculatedOverall,
    };

    // Prepare chart data
    type QuestionWithResponse = { response: { overallScore: number | null; accuracy: number | null; clarity: number | null; confidence: number | null; technicalDepth: number | null } | null };
    const chartData = interviewSession.questions.map((q: QuestionWithResponse, i: number) => ({
        date: `Q${i + 1}`,
        overallScore: q.response?.overallScore || 0,
        accuracy: q.response?.accuracy || 0,
        clarity: q.response?.clarity || 0,
        confidence: q.response?.confidence || 0,
        technicalDepth: q.response?.technicalDepth || 0,
    }));

    // Parse JSON strings back to arrays
    const strengths = report?.strengths ? JSON.parse(report.strengths) : ["Good understanding of fundamentals"];
    const weaknesses = report?.weaknesses ? JSON.parse(report.weaknesses) : ["Could improve on technical depth"];
    const recommendations = report?.recommendations ? JSON.parse(report.recommendations) : ["Practice more coding problems"];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Link
                        href="/history"
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors mt-1"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {getTrackLabel(interviewSession.track)} Interview Report
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(interviewSession.difficulty)}`}>
                                {interviewSession.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(interviewSession.startedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {interviewSession.questions.length} questions
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Report Card */}
            <ReportCard
                overallScore={avgScores.overall}
                accuracy={avgScores.accuracy}
                clarity={avgScores.clarity}
                confidence={avgScores.confidence}
                technicalDepth={avgScores.technicalDepth}
                strengths={strengths}
                weaknesses={weaknesses}
                recommendations={recommendations}
            />

            {/* Score Progress Chart */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Score by Question</h2>
                <ProgressChart data={chartData} type="line" />
            </div>

            {/* Skills Radar */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Skills Breakdown</h2>
                <ProgressChart data={chartData} type="radar" />
            </div>

            {/* Question-by-Question Review */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Question Review</h2>
                {interviewSession.questions.map((question: { id: string; type: string; content: string; response: { overallScore: number | null; answer: string; feedback: string | null } | null }, index: number) => (
                    <div
                        key={question.id}
                        className="p-6 rounded-xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-medium">
                                    Q{index + 1}
                                </span>
                                <span className="text-xs text-gray-500">{question.type}</span>
                            </div>
                            {question.response?.overallScore && (
                                <span
                                    className={`text-lg font-bold ${question.response.overallScore >= 80
                                        ? "text-green-400"
                                        : question.response.overallScore >= 60
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                        }`}
                                >
                                    {Math.round(question.response.overallScore)}/100
                                </span>
                            )}
                        </div>

                        <h3 className="text-white font-medium mb-3">{question.content}</h3>

                        {question.response && (
                            <>
                                <div className="p-4 rounded-lg bg-white/5 mb-4">
                                    <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                                    <p className="text-white">{question.response.answer}</p>
                                </div>

                                {question.response.feedback && (
                                    <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                        <p className="text-sm text-violet-400 mb-1">AI Feedback:</p>
                                        <p className="text-gray-300 text-sm">{question.response.feedback}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Improvement Roadmap */}
            {report?.roadmap && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        4-Week Improvement Roadmap
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {(JSON.parse(report.roadmap) as { week: number; focus: string; resources: string[] }[]).map(
                            (week) => (
                                <div
                                    key={week.week}
                                    className="p-4 rounded-lg bg-white/5"
                                >
                                    <span className="text-xs font-medium text-violet-400">
                                        Week {week.week}
                                    </span>
                                    <h3 className="font-semibold text-white mt-1 mb-2">
                                        {week.focus}
                                    </h3>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        {week.resources.map((resource, i) => (
                                            <li key={i}>• {resource}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
