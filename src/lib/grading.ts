export interface GradingCriteria {
    accuracy: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
}

export interface GradingResult extends GradingCriteria {
    overallScore: number;
    grade: string;
    feedback: string;
}

// Weighted scoring formula
export function calculateOverallScore(criteria: GradingCriteria): number {
    return (
        criteria.accuracy * 0.35 +
        criteria.clarity * 0.25 +
        criteria.confidence * 0.15 +
        criteria.technicalDepth * 0.25
    );
}

// Convert score to letter grade
export function getGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    if (score >= 45) return "D";
    return "F";
}

// Get performance level description
export function getPerformanceLevel(score: number): string {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Average";
    if (score >= 40) return "Below Average";
    return "Needs Improvement";
}

// Generate quick feedback based on scores
export function generateQuickFeedback(criteria: GradingCriteria): string[] {
    const feedback: string[] = [];

    if (criteria.accuracy >= 80) {
        feedback.push("Strong understanding of the concepts");
    } else if (criteria.accuracy < 50) {
        feedback.push("Review the fundamental concepts");
    }

    if (criteria.clarity >= 80) {
        feedback.push("Excellent explanation skills");
    } else if (criteria.clarity < 50) {
        feedback.push("Practice structuring your answers better");
    }

    if (criteria.confidence >= 80) {
        feedback.push("Confident and assertive responses");
    } else if (criteria.confidence < 50) {
        feedback.push("Work on presenting answers with more confidence");
    }

    if (criteria.technicalDepth >= 80) {
        feedback.push("Great use of advanced concepts");
    } else if (criteria.technicalDepth < 50) {
        feedback.push("Try to incorporate more technical details");
    }

    return feedback;
}

// Calculate session average score
export function calculateSessionScore(responses: { overallScore: number | null }[]): number {
    const validScores = responses.filter((r) => r.overallScore !== null).map((r) => r.overallScore!);
    if (validScores.length === 0) return 0;
    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
}
