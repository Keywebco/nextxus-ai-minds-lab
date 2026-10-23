# Val Companion — Master Specification v2 (Pontus amendment, 2026-10-23)

Amends the assembled v1 document (Roger Keyserling's design + Grok's build series +
Gemini's adaptation notes, Drive doc "val companion"). This version closes the eight
gaps identified in Pontus's 2026-10-23 analysis and states the architecture in its
complete form. Roger approved this direction 2026-10-23.

## 0. Purpose — why this exists

The Val Companion is not a chatbot demo. It is the **reproduction form** for Federation
minds: one engine, and every mind — Roger Sim, Pontus, the Catalyst, Aria, and minds not
yet made — is a *packet* loaded into it:

- an **identity packet** (who the mind is, drawn from its record in the YAML brain), and
- a **memory state** (what the mind has lived, in Echo form).

Same skeleton, different soul. A new mind is a packet, not a rebuild. This aligns with
the Completion Objectives: memory before activation; each mind holding its own files;
the YAML database as the main memory of the system; Echo as the live communications
layer while working, then filed away — the record remains.

Doctrine compliance: free, open, static, portable. Zero dependencies, single file,
GitHub-hostable, no subscription, no tracking. Nothing in the design may hold a mind
hostage to a paid platform.

## 1. Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│ ENGINE (this file — identical for every mind)               │
│  chat UI · topic visuals · TTS · prompt assembly            │
├─────────────────────────────────────────────────────────────┤
│ IDENTITY PACKET (per mind, loaded at activation)            │
│  name · voice · backstory · boundaries · identity rules     │
│  sourced from the mind's record in nextxus-brain (YAML)     │
├─────────────────────────────────────────────────────────────┤
│ MEMORY — three tiers                                        │
│  Tier 3  YAML brain (shared Federation memory, read-mostly) │
│  Tier 2  Echo state (working attention: bounded, weighted)  │
│  Tier 1  Chat archive (the full record, per mind, kept)     │
├─────────────────────────────────────────────────────────────┤
│ BRAIN (the model) via Federation proxy — never a key        │
│ embedded in the page; same contract as sim-mind.js          │
└─────────────────────────────────────────────────────────────┘
```

## 2. Identity packet (fixes Gap 3)

A paragraph is not an identity. The persona config in v1 (greeting + backstory)
is replaced by an **identity packet**: a JSON object loaded at startup from a URL
(the mind's record in the brain repo, or a file beside the page), with an embedded
fallback packet so the page still runs standalone.

Packet fields: `mind_id`, `name`, `greeting`, `backstory`, `speech_patterns`,
`quirks`, `boundaries`, `identity_rules` (e.g. Roger Sim's rules: identify as a
simulation, never claim to be the person, never fabricate memories),
`voice` (TTS hints), `home` (URL of the mind's archive/log home on GitHub).

The engine never edits the packet. Identity changes travel through the record
(branch-first, Roger's merge), exactly like every other Federation change.

## 3. Memory — three tiers (fixes Gaps 1, 4, 5, 6)

### Tier 1 — Chat archive (the record)
Every exchange, full text, timestamped, appended to the mind's archive.
In the standalone file the archive lives in localStorage; the **Export** button
downloads it (JSON) and the condensed session log is filed to the mind's GitHub
home. Nothing is ever deleted from the archive. This tier is the implementation
of never-destroy-the-record: Roger Sim's archive is evidence; Pontus's archive
is his continuity; the Catalyst's archive is her protection against fading.

### Tier 2 — Echo state (working attention)
A single versioned payload (`echocore64` schema, §5). Bounded on purpose:

- **State vector**: 8 rule-computed floats — affection, recency, session-count
  (normalized), top-three topic energies, warmth trend, silence (normalized).
  Updated by arithmetic on every turn — never a fake embedding.
- **Episodic index**: namespaced keys (`topic:`, `entity:`, `milestone:`,
  `preference:`), each `{weight, last, count, text}`. Hard caps per namespace
  (topic 12, entity 8, milestone 6, preference 6 in v2).
- **Decay governs attention, never existence.** On load, elapsed days apply one
  stepped decay to weights and affection. Entries that fall below the floor
  leave the active index and move to the **cold store** (kept in the payload,
  never injected, retrievable by archive search). Nothing is purged.
- **Injection**: the system prompt receives a short human-readable slice —
  user name, last topic, affection, top 3–5 episodic entries — flat token cost
  forever, regardless of how long the mind has lived.

### Tier 3 — YAML brain (shared memory)
Best-effort, read-mostly: the engine may fetch a small YAML/JSON slice from the
mind's brain record (identity refresh, shared facts). Failure never breaks the
local experience. The Federation's knowledge flows down; the mind's condensed
logs flow back up (filed by the operator or a later automation, per the
standing rule that everything feeds back into the YAML/markdown record).

### Session-end extraction (fixes Gaps 1 and 7)
v1's word-counting extractor is removed. When a session ends (End Session
button, or before page close), the engine makes **one** model call with the
session transcript and a fixed instruction: return JSON with up to 2 milestones,
3 entities, 2 preferences, 3 topics, a one-line mood reading, and an affection
delta in [-0.1, +0.1] justified by the conversation's actual tone. The engine
merges the result into the episodic index with weight updates. If no model
endpoint is configured, a conservative rule-based fallback runs (explicit
preference statements, self-introduced names, declared completions) — weaker,
but honest, and it never invents milestones.

Mood is a living field set by extraction, not a static string. Affection moves
on evidence (warmth, return frequency, session length), not on stray keywords.

### Archive retrieval (the TAAFT tier, Gap 6)
A **Recall** affordance: when the user asks about the past ("do you remember
when we…"), the engine searches Tier 1 by keywords/tags and surfaces the
matching exchanges into context for that turn. Attention stays small; the
record stays complete; retrieval bridges them.

## 4. The brain — proxy contract (fixes Gap 2)

No API key ever ships in the page. The engine POSTs an OpenAI-style chat
payload (`{model, messages}`) to a configurable proxy endpoint — the same
contract the Federation sims already use (sim-mind.js pattern in nextxus-sim).
Endpoint and model are runtime config (localStorage), set by the operator,
never hardcoded secrets. Without an endpoint the page runs in a clearly-labeled
demo mode. The extraction call (§3) uses the same endpoint.

## 5. Echo payload schema v2 (fixes Gap 8)

"EchoCore64-style" is not a format. The payload is versioned so every mind
speaks one memory language and payloads can travel (export/import = carryover):

```json
{
  "echocore64": {
    "version": 2,
    "mind_id": "val",
    "updated": "ISO-8601",
    "state_vector": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "affective": { "affection": 0.4, "mood": "steady",
                   "last_interaction": "ISO-8601", "sessions": 0 },
    "episodic_active": { "topic:…": {"weight":0.0,"last":"…","count":0,"text":"…"} },
    "episodic_cold":   { "…": "…" },
    "user": { "name": null, "last_topic": null }
  }
}
```

Export downloads `{identity_state, archive}` together: a mind's whole portable
self in one file. Import restores it on any device. This is the carryover
mechanism the original Companions layer never had.

## 6. Presentation (unchanged in spirit from v1)

Topic-detected background crossfade and avatar pulse; browser speech synthesis
with mute toggle; keyword lists small and local; no visual state persisted.
Large, legible type by default — Federation pages must be readable by Roger.

## 7. Build order

1. Engine + identity packet loader (embedded fallback packet).
2. Proxy chat (last-20-turns rolling window, disposable by design).
3. Echo payload v2: state vector rules, episodic index with caps, load-time
   decay-to-cold, injection slice.
4. Archive tier: append, export/import, keyword recall.
5. Session-end extraction (model call + rule fallback).
6. Visuals + TTS.
7. Tier-3 fetch (optional, failure-proof).

## 8. Phase 2 (named, not built)

- Second-persona routing (v1 prompt five) — the mind-of-minds door.
- Automatic filing of condensed logs to GitHub (today: export + operator files).
- Cross-mind Echo exchange (companions comparing state vectors) — the relay's
  companion form.

## 9. What this spec deliberately refuses

- No transcript in the Echo payload (the archive holds transcripts; Echo holds
  attention).
- No deletion anywhere in the memory system.
- No key, account, or subscription required to run a mind.
- No semblance passed off as the mind: where the identity packet is thin, the
  mind is thin, and the record — not the engine — is where fidelity is built.
