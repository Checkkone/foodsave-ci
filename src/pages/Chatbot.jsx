import { useState, useRef, useEffect } from "react";

const CLE_GEMINI = "AIzaSyA6vzv6m8DHYy0VuL33NifmVslCjARt9VA";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! 👋 Je suis FoodBot, ton assistant FoodSave CI. Je peux t'aider à trouver un repas selon ton budget, tes goûts ou tes besoins nutritionnels. Comment puis-je t'aider ?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const bas = useRef(null);

  useEffect(() => {
    bas.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function envoyerMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const nouveauMessage = { role: "user", content: input };
    const historique = [...messages, nouveauMessage];
    setMessages(historique);
    setInput("");
    setLoading(true);

    try {
      const contentsGemini = historique
        .filter((m, index) => !(m.role === "assistant" && index === 0))
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CLE_GEMINI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: `Tu es FoodBot, l'assistant intelligent de FoodSave CI, une application anti-gaspillage alimentaire en Côte d'Ivoire. Tu aides les étudiants à trouver des repas selon leur budget en FCFA, donnes des conseils nutritionnels, et réponds aux questions sur la nourriture locale ivoirienne (attiéké, foutou, riz sauce, kedjenou, alloco etc.). Réponds toujours en français, de façon chaleureuse et courte. Maximum 3 phrases par réponse.`
              }]
            },
            contents: contentsGemini
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Erreur API Gemini");
      }

      const data = await response.json();
      const reponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Désolé, je n'ai pas pu répondre.";

      setMessages([...historique, { role: "assistant", content: reponse }]);

    } catch (err) {
      console.error("Erreur chatbot:", err);
      setMessages([...historique, {
        role: "assistant",
        content: "❌ Erreur : " + err.message
      }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* BOUTON FLOTTANT */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 z-50">
        {ouvert ? "✕" : "🤖"}
      </button>

      {/* FENETRE CHAT */}
      {ouvert && (
        <div
          className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* HEADER */}
          <div className="bg-green-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <p className="text-white font-bold text-sm">FoodBot</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <p className="text-green-100 text-xs">En ligne</p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-green-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bas} />
          </div>

          {/* SUGGESTIONS */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 flex-wrap">
              {[
                "Budget 500 FCFA 🍱",
                "Repas sain 🥗",
                "C'est quoi FoodSave ?"
              ].map((s, i) => (
                <button key={i}
                  onClick={() => setInput(s)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-green-400 hover:text-green-600 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <form onSubmit={envoyerMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
              placeholder="Pose ta question..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}