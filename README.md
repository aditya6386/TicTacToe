# TicTacToe
A fun, 2-player emoji-based battle game built with HTML, CSS, and Vanilla JavaScript. Players take turns selecting emojis from categories — the fastest and most accurate wins the streak!

🔧 Tech Stack
HTML5 – Structure

CSS3 – Styling and animations

JavaScript (Vanilla) – Game logic, UI updates, audio control

🎭 Emoji Categories
The game features multiple emoji categories:

🌍 Animals – 🐶, 🐱, 🐯, 🐵, 🦁, etc.

⚔️ Weapons – 🔪, 🗡️, 🧨, 🔫, 🪓, etc.

🍕 Food – 🍎, 🍔, 🍟, 🍕, 🍩, etc.

🎉 Celebration – 🎈, 🎁, 🎂, 🎆, etc.

😄 Emotions – 😃, 😢, 😡, 😎, 🥳, etc.

New categories can easily be added via a simple configuration array in script.js.

🫥 “Vanishing” Feature
To increase difficulty and excitement, each emoji vanishes after 1.5 seconds if not clicked.

How it works:

On rendering, each emoji element is assigned a timer:
setTimeout(() => {
  emojiElement.classList.add("vanish");
}, 1500);


The .vanish CSS class fades out the emoji with a transition and then removes it:

.vanish {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

This creates a fast-paced environment where reflexes and memory matter!

🚀 Improvements with More Time
If given more time, I would:

Add mobile responsiveness and better layout for touch devices.

Include multiplayer mode via WebSockets (using Node.js & Socket.IO).

Add leaderboard and persistent streak history using localStorage or Firebase.

Add sound controls, pause/resume functionality, and more audio feedback.

Implement accessibility features for colorblind players and keyboard support.

Refactor into a modular ES6 or React-based component structure for scalability.

🧠 Summary
Emoji Battle Game is a fun and fast-paced way to test speed and memory. Built with JavaScript, it showcases interactive front-end development, timed DOM updates, dynamic UI rendering, and gamified UX features.

