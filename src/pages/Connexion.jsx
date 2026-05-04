import { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnexion(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Connexion avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Connexion échouée");

      // 2. Récupérer le rôle
      const { data: profil, error: profileError } = await supabase
        .from("utilisateurs")
        .select("role, nom")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profil) {
        toast.error("Profil introuvable. Réinscris-toi.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      toast.success(`Bienvenue ${profil.nom} !`);
      setTimeout(() => {
        window.location.href = profil.role === "vendeur" ? "/vendeur" : "/etudiant";
      }, 800);

    } catch (err) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect");
      } else if (err.message.includes("Email not confirmed")) {
        toast.error("Vérifie ta boîte mail pour confirmer ton compte");
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
          <p className="text-gray-500 mt-2 text-sm">Content de te revoir 👋</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Connexion à ton compte</h2>
          <form onSubmit={handleConnexion} className="flex flex-col gap-4">
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
                type="password" placeholder="Ton mot de passe"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-lg mt-2 transition-all shadow-lg disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <a href="/inscription"
            className="block w-full text-center border-2 border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-600 font-semibold py-3 rounded-xl transition-all">
            Créer un nouveau compte
          </a>
        </div>
        <p className="text-center mt-5 text-gray-400 text-xs">
          En continuant, tu acceptes les conditions d'utilisation de FoodSave CI
        </p>
      </div>
    </div>
  );
}