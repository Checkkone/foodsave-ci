import { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function Inscription() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("etudiant");
  const [loading, setLoading] = useState(false);

  async function handleInscription(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mot de passe : minimum 6 caractères");
      return;
    }
    setLoading(true);
    try {
      // 1. Créer le compte avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Utilisateur non créé");

      // 2. Sauvegarder le profil dans la table utilisateurs
      const { error: profileError } = await supabase
        .from("utilisateurs")
        .insert({
          id: data.user.id,
          nom,
          email,
          role,
        });

      if (profileError) throw profileError;

      toast.success("Compte créé avec succès !");
      setTimeout(() => {
        window.location.href = role === "vendeur" ? "/vendeur" : "/etudiant";
      }, 1000);

    } catch (err) {
      console.error(err);
      if (err.message.includes("already registered")) {
        toast.error("Cet email est déjà utilisé. Connecte-toi !");
      } else {
        toast.error("Erreur : " + err.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🍱</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-800">
              FoodSave <span className="text-green-600">CI</span>
            </span>
          </a>
          <p className="text-gray-500 mt-2 text-sm">Crée ton compte gratuitement</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button type="button" onClick={() => setRole("etudiant")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${role === "etudiant" ? "border-green-600 bg-green-600 text-white shadow-md" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
            🎓 Étudiant
          </button>
          <button type="button" onClick={() => setRole("vendeur")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${role === "vendeur" ? "border-orange-500 bg-orange-500 text-white shadow-md" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}>
            🍽️ Vendeur
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {role === "etudiant" ? "Inscription étudiant" : "Inscription vendeur"}
          </h2>
          <form onSubmit={handleInscription} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                {role === "etudiant" ? "Ton nom complet" : "Nom du restaurant / maquis"}
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                placeholder={role === "etudiant" ? "Ex: Kouassi Jean" : "Ex: Maquis Le Bonheur"}
                value={nom} onChange={e => setNom(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Adresse email</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                type="email" placeholder="exemple@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Mot de passe</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                type="password" placeholder="Minimum 6 caractères"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white text-lg mt-2 transition-all shadow-lg disabled:opacity-50 ${role === "etudiant" ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}>
              {loading ? "Création en cours..." : "Créer mon compte →"}
            </button>
          </form>
        </div>
        <p className="text-center mt-5 text-gray-500 text-sm">
          Déjà un compte ?{" "}
          <a href="/connexion" className="text-green-600 font-semibold hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}