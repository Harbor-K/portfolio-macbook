// "Kim LLM": a mock assistant that answers questions about Harbor. Nothing is sent anywhere;
// the answers below are canned placeholder copy. Edit them freely.
export const kimLlm = {
  placeholder: "Ask me anything about Harbor...",
  footer: "Powered by Kim LLM · demo",
  suggestions: [
    {
      emoji: "🛠️",
      question: "What's her design toolkit?",
      answer:
        "Harbor works mostly in Figma — design systems, prototyping and multilingual layouts — and uses FigJam for research synthesis. She also builds quick prototypes with AI design tools.",
    },
    {
      emoji: "🏦",
      question: "Tell me about the Trust Bank project",
      answer:
        "A UX research and redesign study of Trust Bank, a Singapore digital bank. Harbor led research, the Define phase and the mid-fi prototype. Double-click Trust Bank on the desktop to read the case study.",
    },
    {
      emoji: "🌏",
      question: "Where has she worked?",
      answer:
        "Harbor has designed for trading and fintech products at UTrada and ETO Markets (Sydney) and for e-learning at Pinetree (Korea), and has lived and worked in Australia and the UK.",
    },
    {
      emoji: "✨",
      question: "Fun facts about Harbor?",
      answer: "She came to product design from a fine art background, and has designed products localized into as many as 11 languages.",
    },
  ],
  fallbackAnswer:
    "Good question! Kim LLM is still in training. For now, try one of the suggested questions — or say hello at harborkim0328@gmail.com.",
};
