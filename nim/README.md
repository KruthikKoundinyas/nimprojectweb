# NimLab

**Interactive Game Theory & Reinforcement Learning Playground**

[▶ Live Demo](https://nimprojectweb.vercel.app/nim/) | [📚 Learn the Strategy](https://nimprojectweb.vercel.app/nim/learn.html) | [💻 Source Code](https://github.com/KruthikKoundinyas/nimprojectweb)

<!-- Replace with actual GIF: record 15-20s showing gameplay + Algorithm Inspector updating -->
![NimLab Demo](./assets/images/nim-Game.png)

---

## Why NimLab?

Nim has a mathematically perfect strategy (the XOR/Nim Sum), making it an ideal environment to compare **analytical algorithms** with **reinforcement learning**.

NimLab demonstrates how two fundamentally different approaches — one that computes the answer from rules, and one that discovers it from experience — can converge on similar decision-making. The project asks a simple question:

> If a problem has a perfect solution, can a learning agent discover it on its own — and what does it look like when it falls short?

---

## Features

- **4 AI Strategies** — Random, Greedy, Optimal (XOR with Misère awareness), Q-Learning
- **Explainable AI** — Algorithm Inspector shows Nim Sum, binary representation, optimal move, and reasoning in real time
- **Learning Mode** — Interactive tutorials: XOR calculator, winning/losing positions, Misère endgame, Q-Learning fundamentals
- **Algorithm Comparison** — Simulate up to 5000 AI vs AI games and visualize win rates
- **Custom Boards** — Any heap configuration, random generation
- **Move History** — Complete log of every move
- **Statistics** — Wins, losses, streaks tracked per difficulty
- **Two-Player Mode** — Play against a friend

<!-- 
Screenshots to add:
1. Algorithm Inspector panel during gameplay
2. Learn page XOR calculator
3. Compare page showing win rate bars (Optimal vs Q-Learning)
-->

---

## How It Works

### The XOR Strategy (Analytical)

The winning strategy uses the **Nim Sum** — the XOR of all heap sizes:
- Nim Sum ≠ 0 → winning position (a move exists to force Nim Sum = 0)
- Nim Sum = 0 → losing position (any move helps the opponent)

In **Misère Nim** (last stone loses), the strategy switches at the endgame: leave an odd number of size-1 heaps.

### The Q-Learning Agent (Learned)

The agent discovers strategy through self-play:
1. Represents each board as a state (e.g., `[1, 3, 5]`)
2. Tracks Q-values for every state-action pair
3. Updates via temporal difference: `Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') - Q(s,a)]`
4. Trains 500+ episodes against a mixed-strategy opponent
5. Uses ε-greedy exploration that decays over time

---

## Results

Simulation results (200 games each, board [1, 3, 5], alternating first mover):

| Matchup | Agent A | Agent B | Insight |
|---------|---------|---------|---------|
| Optimal vs Random | ~92% | ~8% | Mathematical strategy dominates |
| Optimal vs Q-Learning | ~60-65% | ~35-40% | Learning approaches but can't match perfection |
| Q-Learning vs Random | ~75-85% | ~15-25% | Agent learned meaningful strategy |
| Greedy vs Random | ~55-65% | ~35-45% | Heuristic offers marginal advantage |

The Q-Learning agent converges toward optimal play but doesn't fully match it — demonstrating both the power and limitations of experience-based learning versus analytical solutions.

---

## Key Takeaways

- **Reinforcement learning is not always the best solution.** When a problem has a closed-form answer, analytical approaches are faster and provably optimal.
- **Learned policies approximate but rarely equal mathematical solutions.** The Q-agent reaches ~40% win rate against perfect play — meaningful, but imperfect.
- **Explainability transforms perception.** Showing *why* an AI makes a decision turns a black box into an educational tool.
- **The value is in the comparison.** Two approaches arriving at similar decisions through completely different processes reveals something about intelligence itself.

---

## Where These Concepts Live in Industry

The algorithms in this project aren't academic exercises — they're the foundations of billion-dollar systems:

| Concept (in NimLab) | Real-World Technology |
|---------------------|---------------------|
| **XOR / Nim Sum** | RAID storage (disk parity recovery), AES encryption, SHA-256 (Bitcoin mining), error-correcting codes (Hamming, CRC), TCP/IP checksums |
| **Q-Learning** | AlphaGo/AlphaZero (DeepMind), OpenAI Five (Dota 2), AlphaStar (StarCraft II), robotics control, autonomous trading |
| **RLHF (scaled RL)** | ChatGPT alignment, Claude, Gemini — how LLMs learn to be useful from human preferences |
| **ε-Greedy (explore/exploit)** | Google/Meta ad serving (multi-armed bandits), Netflix/YouTube recommendations, adaptive clinical drug trials |
| **Game Theory** | Auction design (Google Ads, spectrum), matching markets (kidney exchanges), network routing, Nash equilibrium in pricing |
| **Combinatorial Games** | Nimrod (1951) — one of the first digital computers ever built, designed to play Nim |

The through-line: a XOR strategy that solves a toy game is the same math that protects bank transactions. A Q-table learning optimal play through self-play is the same idea — scaled up — behind AlphaGo and ChatGPT's training pipeline.

---

## Architecture

```
nim/
├── index.html          # Landing page with navigation
├── one-player.html     # Play vs AI + Algorithm Inspector
├── two-player.html     # Two-player mode
├── learn.html          # Interactive learning tutorials
├── compare.html        # AI vs AI simulation
├── css/styles.css      # Responsive, dark/light mode
├── js/
│   ├── ai.js           # Q-Learning agent, training, simulation
│   ├── game-core.js    # Game engine, optimal strategy, inspector
│   ├── one-player.js   # Stats tracking
│   └── two-player.js   # Two-player logic
└── assets/
```

**Design decisions:**
- No build tools — runs directly in any browser
- localStorage for Q-values, stats, and theme persistence
- All AI strategies in pure JavaScript (~300 lines)
- Correct Misère strategy with endgame switching (the hard part most implementations get wrong)

---

## Run Locally

```bash
git clone https://github.com/KruthikKoundinyas/nimprojectweb.git
cd nimprojectweb/nim
npx serve .
# or just open index.html
```

No dependencies. No build step. No installation.

---

## Future Work

- Deep Q-Networks for larger/variable board sizes
- Monte Carlo Tree Search comparison
- Training visualization (episode reward curves)
- WebAssembly for faster bulk simulation

---

**Built by [Kruthik Koundinyas](https://kruthik.vercel.app)** · [Portfolio](https://kruthik.vercel.app) · [GitHub](https://github.com/KruthikKoundinyas) · [LinkedIn](https://linkedin.com/in/kruthikkoundinyas)
