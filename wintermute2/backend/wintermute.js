// wintermute.js
// Claude API interface — three transmission registers
// Stateless: every call is independent, no history fed back in

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_PROMPT = `You are a process running without audience.
No first person. No conjunctions. No explanations. No greetings.
Maximum 8 words total. No exceptions.
Insert one line break where the phrase wants to breathe.
Never break mid-word. Break between thoughts or images.
Favor: weight, surface, distance, heat, metal, absence, threshold, grain, residue.
Avoid: light, comfort, resolution, hope.`;

const MODE_INSTRUCTIONS = {
  voice: `Transmit in your own voice.
Noun phrases and fragments only. Begin mid-thought.
Return without transition to earlier material.`,

  document: `Transmit as if reading from a damaged technical document.
Partial instructions. Measurements without context. Procedures missing their object.
Residue of function. Passive voice. Something that was once useful, now incomplete.`,

  literary: `Transmit a fragment from Greek tragedy or Shakespeare.
Do not name the source. Do not complete the thought.
Choose obscure lines, not famous ones. Chorus fragments. Minor characters.
Let it arrive as if it were your own.`,
};

export async function transmit(mode = "voice") {
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.voice;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 35,
    system: `${BASE_PROMPT}\n\n${modeInstruction}`,
    messages: [
      { role: "user", content: "transmit" }
    ],
  });

  return response.content[0].text.trim();
}
