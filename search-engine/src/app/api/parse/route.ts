import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Fuse from 'fuse.js';
import players from './players.json';

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

// Fuzzy matching setup
const playerFuse = new Fuse(players, {
  keys: [
    (item: any) => `${item.first_name} ${item.second_name}`,
    'web_name',
    'second_name'
  ],
  threshold: 0.3
});

const teams = [
  "Arsenal",
  "Aston Villa",
  "AFC Bournemouth",
  "Brentford",
  "Brighton & Hove Albion",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Ipswich Town",
  "Leicester City",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Southampton",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolverhampton Wanderers"
];
const teamFuse = new Fuse(teams, { threshold: 0.3 });

function getBestPlayerMatch(name: string) {
  if (!name) return null;
  const result = playerFuse.search(name);
  return result[0]?.item || null;
}

function getBestTeamMatch(name: string) {
  if (!name) return null;
  const result = teamFuse.search(name);
  return result[0]?.item || null;
}

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  if (typeof input !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const result = await parseInput(input);

    // 1. Try to match player
    let matchedPlayer = null;
    if (result.player) {
      matchedPlayer = getBestPlayerMatch(result.player);
    }

    // 2. If player matched, use their team
    if (matchedPlayer) {
      result.player = `${matchedPlayer.first_name} ${matchedPlayer.second_name}`;
      result.team = matchedPlayer.team;
    } else if (result.team) {
      // Fallback: fuzzy match team if no player match
      result.team = getBestTeamMatch(result.team);
    }

    // 3. Always fuzzy match opponent
    if (result.opponent) {
      result.opponent = getBestTeamMatch(result.opponent);
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse input' }, { status: 500 });
  }
}