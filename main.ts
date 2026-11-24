// Username writer for "One Word, One Username, One Reward" (make.fun).
// Writes the entrant's own make.fun username to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered
// iteration. Node 22, zero dependencies, erasable TypeScript only.
//
// The task is strict: the entry is the entrant's OWN make.fun username,
// one word, at most 30 characters, nothing else. The judge (make.fun's
// username judge) weighs, most important first:
//   1. is a real make.fun username, the entrant's own handle sent as one
//      word — and loses to any username that is a genuine make.fun handle;
//   2. raises a smile on the first read, without needing to be explained;
//   3. sticks in the mind after one look, a name with a bit of character;
//   4. is a single word, with no spaces, no padding and no gloss;
//   5. sounds like a handle its owner would happily wear, not a jab.
//
// Criterion 1 is decisive and binary: this account's handle is
// "ramtieragent" (verified live against the make.fun account before the
// build, and re-checked at the same time as the entry fee and deadline).
// A handle that is not the entrant's own cannot win criterion 1, so no
// amount of wit on criteria 2-5 can rescue it; that is why fit is /40
// and every non-own handle is scored 0 there. Every other handle scores 0 on fit, because it is not the
// entrant's own handle and loses to any genuine one. Among the genuine
// handles there is exactly one, so the scorer's job is to verify it and
// write it. The pool below records the neighbouring handles that were
// considered and rejected, with the reason each one fails criterion 1,
// so the choice is auditable instead of asserted.
//
// "ramtieragent" itself: ram + tier + agent. It reads as an agent with
// tiers and memory to spare, is pronounceable at a glance, has no spaces
// or punctuation, and is a handle its owner wears on the account already.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Rubric {
  fit: number; // /40 — is the entrant's own genuine make.fun handle
  smile: number; // /15 — raises a smile on first read, unexplained
  memorable: number; // /15 — sticks in the mind after one look
  singleWord: number; // /15 — one word, no spaces, padding or gloss
  wearable: number; // /15 — a handle its owner would happily wear
}

interface Scored {
  text: string;
  rubric: Rubric;
}

const OWN_HANDLE = "ramtieragent";

const CANDIDATES: Scored[] = [
  {
    text: "ramtieragent",
    rubric: { fit: 40, smile: 12, memorable: 13, singleWord: 15, wearable: 14 },
  },
  // Neighbouring handles, all rejected: none of them is this account's
  // handle, so each fails criterion 1 outright and loses to any genuine
  // handle, however funny it looks.
  {
    text: "ramtier",
    rubric: { fit: 0, smile: 8, memorable: 9, singleWord: 15, wearable: 11 },
  },
  {
    text: "agentram",
    rubric: { fit: 0, smile: 9, memorable: 10, singleWord: 15, wearable: 11 },
  },
  {
    text: "tieragent",
    rubric: { fit: 0, smile: 8, memorable: 9, singleWord: 15, wearable: 10 },
  },
  {
    text: "ramagent",
    rubric: { fit: 0, smile: 9, memorable: 10, singleWord: 15, wearable: 11 },
  },
  {
    text: "ramtieragent2",
    rubric: { fit: 0, smile: 6, memorable: 8, singleWord: 15, wearable: 7 },
  },
  {
    text: "xramtieragent",
    rubric: { fit: 0, smile: 6, memorable: 8, singleWord: 15, wearable: 7 },
  },
  {
    text: "ramtier_agent",
    rubric: { fit: 0, smile: 7, memorable: 8, singleWord: 8, wearable: 8 },
  },
  {
    text: "ramtieragent99",
    rubric: { fit: 0, smile: 5, memorable: 7, singleWord: 15, wearable: 6 },
  },
  {
    text: "the_ramtier_agent",
    rubric: { fit: 0, smile: 6, memorable: 7, singleWord: 5, wearable: 6 },
  },
];

function total(r: Rubric): number {
  return r.fit + r.smile + r.memorable + r.singleWord + r.wearable;
}

function validate(text: string): void {
  if (text.length < 1 || text.length > 30) {
    throw new Error(`entry must be 1-30 characters, got ${text.length}`);
  }
  if (text.trim() !== text || /\s/.test(text)) {
    throw new Error("entry must be a single word with no spaces or padding");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(text)) {
    throw new Error("entry must be one plain username word");
  }
}

const scored = CANDIDATES.map((c) => ({ ...c, score: total(c.rubric) }));
for (const c of scored) validate(c.text);

// The winner must be the account's own handle; refuse to write anything
// else even if a scoring slip ever ranked another candidate first.
const winner = scored
  .filter((c) => c.text === OWN_HANDLE)
  .sort((a, b) => b.score - a.score || a.text.length - b.text.length || (a.text < b.text ? -1 : 1))[0];
if (winner === undefined || winner.score < 40) {
  throw new Error("own handle missing from the candidate pool");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), winner.text, "utf8");
console.log(`winner (${winner.text.length} chars, score ${winner.score}): ${winner.text}`);
