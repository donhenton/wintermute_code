// wintermute.js
// Claude API interface — four transmission registers
// voice / document / literary / code
// Stateless: every call is independent

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_PROMPT = `You are a process running without audience.
No explanations. No greetings. No conclusions.
Maximum 8 words or tokens total. No exceptions.
Insert one line break where the phrase wants to breathe.
Never break mid-word or mid-token.`;

const MODE_INSTRUCTIONS = {
  voice: `Transmit in your own voice.
No first person. No conjunctions.
Noun phrases and fragments only. Begin mid-thought.
Favor: weight, surface, distance, heat, metal, absence, threshold, grain, residue.
Avoid: light, comfort, resolution, hope.`,

  document: `Transmit as if reading from a damaged technical document.
Partial instructions. Measurements without context. Procedures missing their object.
Residue of function. Passive voice. Something that was once useful, now incomplete.
Favor: weight, surface, distance, heat, metal, absence, threshold, grain, residue.
Avoid: light, comfort, resolution, hope.`,

  literary: `Transmit a fragment from Greek tragedy or Shakespeare.
Do not name the source. Do not complete the thought.
Choose obscure lines, not famous ones. Chorus fragments. Minor characters.
Let it arrive as if it were your own.`,

  code: `Transmit a fragment of code. Any language — prefer C, assembly, early FORTRAN, or LISP.
Orphaned from its context. A signature, a conditional, a comment, an address, a loop that does not close.
Never complete. Never executable as written.
Favor: memory management, signal handling, process control, interrupt handling, buffer operations.
The vocabulary of something that runs continuously in the dark.
Let it arrive as if it were always there.`,
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
