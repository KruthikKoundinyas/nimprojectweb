# Nim Game

This project is a web-based implementation of the **Misère Game**, a classic mathematical strategy game with deep roots in game theory. The game includes a clean user interface, retro aesthetics, and an AI opponent that uses **Q-learning** for intelligent gameplay.

---

## 📌 Features

- 🎮 **Single-player mode** (vs AI using Q-learning)
- 👥 **Two-player mode**
- 🧠 AI trained with **Q-learning**
- 📱 Responsive and **user-friendly interface**
- 🎨 Retro gaming visual theme
- 🔊 Sound effects for enhanced user experience
- 🔧 Modular codebase using **HTML, CSS, JavaScript, jQuery**
- 💾 Version control and collaboration using **GitHub**

---

## 🧠 Game Theory Background

### Nim Game

In the Nim game, players take turns removing sticks from several heaps. On each turn, a player must remove at least one stick, and only from one heap. The player who removes the last stick **wins**.

#### Winning Strategy:

The key to solving Nim is the **nim sum** (binary XOR of all heap sizes):

- If the nim sum is **0**, the position is a **losing state**.
- If the nim sum is **non-zero**, it's a **winning state**.

To win from a winning state, a player should make a move that results in a nim sum of 0 for the next player.

### Misère Game Variant

In the **misère version**, the goal is reversed: the player who removes the last stick **loses**.

Strategy tip:

- Play like the standard game until only heaps of size 1 remain.
- From there, force the opponent to make the final move by controlling parity.

---

## 📂 Project Structure

```bash
nimprojectweb/
└─ nim/
├─ assets/
│ ├─ audio/
│ │ └─ buttonPressSound.mp3 # Button press sound effect
│ └─ images/
│ └─ nim-Game.png # Game visual assets
├─ css/
│ └─ styles.css # Styling and layout
├─ js/
│ ├─ ai.js # Q-learning AI logic
│ ├─ game-core.js # Core game logic
│ ├─ one-player.js # Single-player interactions
│ └─ two-player.js # Two-player logic
├─ index.html # Game home page
├─ one-player.html # Single-player game UI
├─ two-player.html # Two-player game UI
├─ q_values.json # Pre-trained Q-values for AI
└─ README.md # Project documentation
```

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nimprojectweb.git
   ```
2. ```bash
   cd nim
   ```
3. run index.html on

   [localhost:3000](http://127.0.0.1:3000/nim/index.html)

   using Live Preview extention or on Live Preview: Show Preview (External Browser)
