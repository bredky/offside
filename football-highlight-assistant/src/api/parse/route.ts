import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseInput(input: string): Promise<any> {
    const prompt = `
Given a user's football highlight query, extract the following fields as JSON:
- player: The player's full name.
- team: The club the player was playing for in the match (infer from context if not stated).
- opponent: The opposing team.
- event: One of "goal", "assist", or "save".
- eventOrder: The number of the event (e.g., "second goal" = 2).

Use football knowledge and context clues to infer missing info (e.g., Bruno Fernandes plays for Manchester United).

Example:
Input: "Show me Bruno Fernandes' second goal vs Real Sociedad"
Output:
{
  "player": "Bruno Fernandes",
  "team": "Manchester United",
  "opponent": "Real Sociedad",
  "event": "goal",
  "eventOrder": 2
}

Input: "${input}"
Output:
`;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
        return {};
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { input } = req.body;

    if (typeof input !== 'string') {
        res.status(400).json({ error: 'Invalid input' });
        return;
    }

    try {
        const result = await parseInput(input);
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to parse input' });
    }
}