import { useEffect, useState } from "react";

export default function Accueil() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🍱</span>
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              FoodSave <span className="text-green-600">CI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
  <a href="/connexion"
    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm">
    Se connecter
  </a>
  <a href="/inscription"
    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm">
    S'inscrire gratuitement
  </a>
</div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">

        <div className="absolute top-20 right-0 w-96 h-96 bg-green-100 rounded-full opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-emerald-100 rounded-full opacity-30 blur-3xl pointer-events-none"></div>

        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Disponible autour de votre campus — Côte d'Ivoire
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-snug">
  Des repas à{" "}
  <span className="text-green-600">-70%</span>
  <br />
  autour de ton campus
</h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
  Mange bien, dépense moins. FoodSave CI transforme les invendus des restaurants en bonnes affaires pour les étudiants.
</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {["✅ Gratuit", "✅ Sans carte bancaire", "✅ En 2 minutes"].map((item, i) => (
              <span key={i} className="text-gray-400 text-sm">{item}</span>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-4">
            {[
              { value: "−70%", label: "sur le prix des repas", icon: "💸" },
              { value: "500+", label: "étudiants bénéficiaires", icon: "🎓" },
              { value: "0 FCFA", label: "pour s'inscrire", icon: "🎁" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-3xl font-extrabold text-green-600 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-gray-300 text-xs">Défiler</span>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Simple et rapide
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Comment ça marche ?</h2>
            <p className="text-gray-400 mt-3 text-lg">3 étapes, moins de 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200 z-0"></div>
            {[
              { step: "01", icon: "🔍", title: "Trouve une offre", desc: "Consulte les repas disponibles autour de ton campus en temps réel, à prix réduit.", color: "bg-blue-50 border-blue-100" },
              { step: "02", icon: "⚡", title: "Réserve en 1 clic", desc: "Réserve ton repas avant qu'il soit épuisé et reçois ton code de retrait instantanément.", color: "bg-green-50 border-green-100" },
              { step: "03", icon: "🎉", title: "Récupère et mange", desc: "Présente ton code au vendeur et profite de ton repas à prix mini !", color: "bg-orange-50 border-orange-100" },
            ].map((item, i) => (
              <div key={i} className={`relative z-10 ${item.color} rounded-3xl p-8 border-2 hover:shadow-xl transition-all hover:-translate-y-2 group`}>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-md mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-6xl font-extrabold text-gray-100 absolute top-4 right-5 select-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POUR QUI */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Pour tout le monde
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Qui peut utiliser FoodSave CI ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🎓</div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-800">Tu es étudiant ?</h3>
                  <p className="text-green-600 text-sm font-medium">Mange mieux, dépense moins</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Accède à des repas jusqu'à -70%",
                  "Trouve des offres proches de ton campus",
                  "Réserve en quelques secondes",
                  "Reçois ton code de retrait instantanément",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-green-700 font-bold text-sm">💰 Économise jusqu'à <span className="text-2xl">1 400 FCFA</span> par repas</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🍽️</div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-800">Tu es vendeur ?</h3>
                  <p className="text-orange-500 text-sm font-medium">Écoule tes invendus, augmente tes revenus</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Publie une offre en moins de 2 minutes",
                  "Écoule tes invendus avant fermeture",
                  "Gagne un revenu supplémentaire",
                  "Fidélise une nouvelle clientèle étudiante",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <p className="text-orange-700 font-bold text-sm">📈 Augmente tes revenus de <span className="text-2xl">+30%</span> par mois</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/inscription"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Rejoindre FoodSave CI gratuitement →
            </a>
            <p className="text-gray-400 text-sm mt-3">Tu choisiras ton profil lors de l'inscription</p>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Ils nous font confiance
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Ce qu'ils en pensent</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nom: "Adjoua Marie", role: "Étudiante en Master", avis: "L'application est super simple. Je réserve en 30 secondes depuis mon téléphone !", avatar: "👩🏿", note: 5 },
              { nom: "Maquis Le Bonheur", role: "Restaurant partenaire", avis: "Je ne jette plus rien ! Mes invendus partent en quelques minutes grâce à FoodSave.", avatar: "🍽️", note: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.note)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.avis}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.nom}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 px-6 bg-green-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Notre impact en chiffres</h2>
            <p className="text-green-100 text-lg">FoodSave CI, c'est bon pour toi et pour la planète</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Étudiants inscrits", icon: "🎓" },
              { value: "1 200", label: "Repas sauvés", icon: "🍱" },
              { value: "350 kg", label: "Gaspillage évité", icon: "🌱" },
              { value: "250 000", label: "FCFA économisés", icon: "💰" },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
                <p className="text-3xl mb-2">{s.icon}</p>
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-green-100 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl">
            🍱
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Prêt à rejoindre<br />FoodSave CI ?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Inscription gratuite en 2 minutes. Aucune carte bancaire requise.
          </p>
          <a href="/inscription"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold px-12 py-5 rounded-2xl text-xl transition-all shadow-2xl hover:-translate-y-1">
            Commencer gratuitement →
          </a>
          <p className="text-gray-600 text-sm mt-6">
            ✅ Gratuit &nbsp;·&nbsp; ✅ Sans carte bancaire &nbsp;·&nbsp; ✅ En 2 minutes
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-500 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white">🍱</span>
              </div>
              <span className="text-white font-extrabold text-lg">FoodSave CI</span>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-600">© 2026 FoodSave CI — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}