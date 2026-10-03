import { executeHttpRequest } from '../utils/httpHelper.ts';
import type { LyzrChatPayload } from '../models/types.ts';

const DEFAULT_LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const DEFAULT_AGENT_ID = '6ac0c944b9fb570e2390c041';

export interface LyzrResponse {
  message: string;
  source: 'lyzr' | 'gemini-fallback' | 'adaptive-engine';
  sessionId: string;
  success: boolean;
  statusNote?: string;
}

export class LyzrService {
  get apiUrl(): string {
    return process.env.LYZR_API_URL || DEFAULT_LYZR_API_URL;
  }

  get agentId(): string {
    return process.env.LYZR_AGENT_ID || DEFAULT_AGENT_ID;
  }

  get apiKey(): string {
    return process.env.LYZR_API_KEY || '';
  }

  /**
   * Send candidate message or setup prompt to the Lyzr Agent.
   * If the Lyzr endpoint is unreachable or returns an error (e.g. sandbox egress proxy or offline),
   * smoothly switch to an adaptive AI fallback engine.
   */
  async sendMessage(
    userId: string,
    sessionId: string,
    message: string,
    systemContext?: string
  ): Promise<LyzrResponse> {
    const payload: LyzrChatPayload = {
      user_id: userId,
      agent_id: this.agentId,
      session_id: sessionId,
      message: message
    };

    // Attempt Lyzr Agent call first
    if (this.apiKey) {
      try {
        console.log(`[LyzrService] Calling Lyzr Agent for session ${sessionId}...`);
        const response = await executeHttpRequest(
          this.apiUrl,
          'POST',
          {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          payload,
          15000 // 15s timeout
        );

        if (response.status === 200 && response.data) {
          const aiMessage = this.extractLyzrMessage(response.data);
          if (aiMessage) {
            console.log(`[LyzrService] Lyzr Agent responded successfully.`);
            return {
              message: aiMessage,
              source: 'lyzr',
              sessionId,
              success: true
            };
          }
        } else {
          console.warn(`[LyzrService] Lyzr Agent returned status ${response.status}: ${JSON.stringify(response.data)}`);
        }
      } catch (err: any) {
        console.warn(`[LyzrService] Lyzr Agent request failed: ${err.message}. Activating adaptive AI fallback...`);
      }
    } else {
      console.warn('[LyzrService] LYZR_API_KEY not found in environment. Using fallback engine.');
    }

    // Fallback: Gemini adaptive interviewer engine
    try {
      console.log(`[LyzrService] Engaging Gemini adaptive interview fallback...`);
      const fallbackPrompt = this.buildFallbackPrompt(message, systemContext);
      const geminiRes = await executeHttpRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        'POST',
        { 'Content-Type': 'application/json' },
        {
          contents: [{ parts: [{ text: fallbackPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        },
        18000
      );

      if (geminiRes.status === 200 && geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = geminiRes.data.candidates[0].content.parts[0].text.trim();
        return {
          message: text,
          source: 'gemini-fallback',
          sessionId,
          success: true,
          statusNote: 'Operating via adaptive fallback (Lyzr Agent sandbox proxy fallback)'
        };
      }
    } catch (fallbackErr: any) {
      console.error('[LyzrService] Gemini fallback failed:', fallbackErr.message);
    }

    // Ultimate rule-based adaptive engine fallback to guarantee 0% failure
    return {
      message: this.generateRuleBasedFollowUp(message, systemContext),
      source: 'adaptive-engine',
      sessionId,
      success: true,
      statusNote: 'Operating via built-in adaptive interview engine'
    };
  }

  /**
   * Health check / connection test for Lyzr Agent
   */
  async testConnection(): Promise<{ connected: boolean; status: number; message: string }> {
    if (!this.apiKey) {
      return {
        connected: false,
        status: 400,
        message: 'LYZR_API_KEY is not configured in .env'
      };
    }

    try {
      const response = await executeHttpRequest(
        this.apiUrl,
        'POST',
        {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        {
          user_id: 'test@demo.com',
          agent_id: this.agentId,
          session_id: 'health-check-' + Date.now(),
          message: 'Ping'
        },
        8000
      );

      if (response.status === 200) {
        return {
          connected: true,
          status: 200,
          message: 'Connected to Lyzr Agent successfully.'
        };
      } else {
        return {
          connected: false,
          status: response.status,
          message: `Lyzr returned status ${response.status} (${response.status === 403 ? 'Sandbox proxy network restriction' : 'Authentication or Agent error'})`
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        status: 500,
        message: err.message || 'Network error connecting to Lyzr Agent'
      };
    }
  }

  private extractLyzrMessage(data: any): string | null {
    if (typeof data === 'string') return data;
    if (data.response && typeof data.response === 'string') return data.response;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.text && typeof data.text === 'string') return data.text;
    if (data.content && typeof data.content === 'string') return data.content;
    if (data.output && typeof data.output === 'string') return data.output;
    if (data.data?.message) return data.data.message;
    if (data.data?.response) return data.data.response;
    return null;
  }

  private buildFallbackPrompt(candidateMsg: string, systemContext?: string): string {
    return `You are an elite, professional AI Technical Interviewer conducting a mock interview on behalf of Lyzr Agent.
Interview Context:
${systemContext || 'Standard Software Engineering Interview'}

Candidate's Answer / Initial prompt:
"${candidateMsg}"

Adaptive Interviewing Instructions:
1. Evaluate the candidate's response.
2. If the answer was weak or incomplete: acknowledge what was said, then ask an adaptive clarifying follow-up to probe deeper or reduce ambiguity.
3. If the answer was strong and complete: briefly praise the technical precision, then increase the difficulty or pivot to a practical real-world scenario or the next topic.
4. Keep your tone encouraging, professional, and concise (under 3-4 sentences). Do NOT provide a lecture. Always end with your direct question.
5. If this is the start of the interview, greet the candidate warmly and ask Question 1.`;
  }

  private generateRuleBasedFollowUp(candidateMsg: string, context?: string): string {
    const text = (candidateMsg || '').toLowerCase();
    if (text.length < 25) {
      return "That touches on the concept, but could you elaborate a bit more with a concrete example or explain how it works under the hood?";
    }
    if (text.includes('database') || text.includes('sql') || text.includes('table')) {
      return "Good point on database structure. How would you optimize the indexing strategy if this table grew to 10 million rows with high read traffic?";
    }
    if (text.includes('python') || text.includes('list') || text.includes('tuple')) {
      return "Interesting. In terms of memory consumption and concurrency safety, what are the primary trade-offs between lists and tuples in Python?";
    }
    return "Great explanation. Moving to the next aspect: how would you handle potential edge cases or failure modes in that implementation?";
  }
}

export const lyzrService = new LyzrService();
