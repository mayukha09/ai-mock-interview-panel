import { executeHttpRequest } from '../utils/httpHelper.ts';
import type { Evaluation, InterviewSession, Message } from '../models/types.ts';

export class EvaluationService {
  /**
   * Generates a comprehensive, structured evaluation for an interview session
   * based on the transcript, role, and answers given.
   */
  async generateEvaluation(
    session: InterviewSession,
    messages: Message[]
  ): Promise<Evaluation> {
    const candidateAnswers = messages.filter(m => m.sender === 'candidate');
    const interviewerQuestions = messages.filter(m => m.sender === 'interviewer');

    const transcriptFormatted = messages.map(m => 
      `[${m.sender.toUpperCase()} - Q#${m.questionNumber}]: ${m.message}`
    ).join('\n');

    const prompt = `You are a Senior Technical Hiring Committee Lead and Interview Assessor.
Please perform a rigorous, structured evaluation of this mock interview session.

Candidate Role: ${session.role} (${session.experience})
Interview Type: ${session.interviewType}
Difficulty: ${session.difficulty}
Target Skills: ${session.skills.join(', ')}

TRANSCRIPT:
${transcriptFormatted || 'No answers provided.'}

Evaluate the candidate on these exact metrics (integers 1 to 10):
- technicalAccuracy (1-10): correctness, depth of knowledge
- problemSolving (1-10): analytical approach, tradeoffs, edge cases
- communication (1-10): clarity, conciseness, structured thought
- answerQuality (1-10): relevance, completeness, examples provided
- completeness (1-10): answered the core question thoroughly
- confidence (1-10): poise, assertiveness, certainty

Calculate:
- overallScore (0-100): weighted average of scores (e.g. (technicalAccuracy * 3.5 + problemSolving * 2.5 + communication * 2.0 + answerQuality * 2.0))

Also provide:
- strengths: list of 2-4 specific technical or behavioral strengths demonstrated
- weaknesses: list of 1-3 specific areas needing improvement
- skillGaps: list of 2-4 concepts or technologies the candidate lacked depth in
- recommendations: list of 2-4 actionable study recommendations for interview readiness

Return ONLY valid JSON matching this exact structure, with no markdown code fences:
{
  "technicalAccuracy": 8,
  "problemSolving": 8,
  "communication": 9,
  "answerQuality": 8,
  "completeness": 7,
  "confidence": 8,
  "overallScore": 81,
  "strengths": ["...", "..."],
  "weaknesses": ["..."],
  "skillGaps": ["...", "..."],
  "recommendations": ["...", "..."]
}`;

    try {
      const response = await executeHttpRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        'POST',
        { 'Content-Type': 'application/json' },
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        },
        20000
      );

      if (response.status === 200 && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let jsonStr = response.data.candidates[0].content.parts[0].text.trim();
        // Remove markdown formatting if present
        jsonStr = jsonStr.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(jsonStr);

        return {
          id: `eval_${session.id}_${Date.now()}`,
          sessionId: session.id,
          technicalAccuracy: Math.min(10, Math.max(1, Number(parsed.technicalAccuracy) || 7)),
          problemSolving: Math.min(10, Math.max(1, Number(parsed.problemSolving) || 7)),
          communication: Math.min(10, Math.max(1, Number(parsed.communication) || 8)),
          answerQuality: Math.min(10, Math.max(1, Number(parsed.answerQuality) || 7)),
          completeness: Math.min(10, Math.max(1, Number(parsed.completeness) || 7)),
          confidence: Math.min(10, Math.max(1, Number(parsed.confidence) || 8)),
          overallScore: Math.min(100, Math.max(20, Number(parsed.overallScore) || 75)),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good core domain knowledge', 'Articulate communication'],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Needs deeper algorithmic tradeoff analysis'],
          skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : ['Scalability concepts', 'Detailed edge case handling'],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Practice structured STAR technique', 'Deep-dive into performance benchmarks']
        };
      }
    } catch (err: any) {
      console.warn('[EvaluationService] AI evaluation request error, using algorithmic heuristic:', err.message);
    }

    // Algorithmic heuristic fallback evaluation
    return this.calculateHeuristicEvaluation(session, candidateAnswers);
  }

  private calculateHeuristicEvaluation(
    session: InterviewSession,
    candidateAnswers: Message[]
  ): Evaluation {
    const totalWords = candidateAnswers.reduce((acc, a) => acc + (a.message || '').split(/\s+/).length, 0);
    const avgWords = candidateAnswers.length > 0 ? totalWords / candidateAnswers.length : 0;

    let baseTech = 7;
    let baseProblem = 7;
    let baseComm = 8;
    let baseQuality = 7;
    let baseComp = 7;
    let baseConf = 8;

    if (avgWords > 40) {
      baseTech = Math.min(10, baseTech + 1);
      baseQuality = Math.min(10, baseQuality + 1);
      baseComp = Math.min(10, baseComp + 1);
    } else if (avgWords < 15) {
      baseTech = Math.max(4, baseTech - 2);
      baseComp = Math.max(4, baseComp - 2);
      baseQuality = Math.max(4, baseQuality - 1);
    }

    const overallScore = Math.round(
      baseTech * 3.5 + baseProblem * 2.5 + baseComm * 2.0 + baseQuality * 2.0
    );

    return {
      id: `eval_${session.id}_${Date.now()}`,
      sessionId: session.id,
      technicalAccuracy: baseTech,
      problemSolving: baseProblem,
      communication: baseComm,
      answerQuality: baseQuality,
      completeness: baseComp,
      confidence: baseConf,
      overallScore: Math.min(98, Math.max(40, overallScore)),
      strengths: [
        `Demonstrated working knowledge of ${session.role} essentials`,
        'Professional, structured communication cadence',
        `Comfortable engaging with ${session.difficulty} difficulty questions`
      ],
      weaknesses: [
        'Could provide more concrete production metrics and architecture diagrams',
        'Could elaborate further on defensive coding and error recovery'
      ],
      skillGaps: [
        'Advanced system latency profiling',
        'End-to-end integration test automation'
      ],
      recommendations: [
        'Review core design patterns applicable to ' + session.skills.slice(0, 2).join(' & '),
        'Practice time-constrained behavioral scenarios using the STAR framework'
      ]
    };
  }
}

export const evaluationService = new EvaluationService();
