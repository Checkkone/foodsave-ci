import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function DashboardVendeur() {
  const [offres, setOffres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [onglet, setOnglet] = useState("offres");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [nom, setNom] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    nom_plat: "", description: "",
    prix_normal: "", prix_reduit: "",
    quantite: "", heure_limite: "",
    adresse: "", latitude: "", longitude: ""
  });

  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Session expirée. Reconnecte-toi.");
        window.location.href = "/connexion";
        return;
      }
      setUserId(user.id);
    }
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    chargerProfil();
    chargerDonnees();
  }, [userId]);

  async function chargerProfil() {
    const { data } = await supabase
      .from("utilisateurs")
      .select("nom")
      .eq("id", userId)
      .single();
    if (data) setNom(data.nom);
  }

  async function chargerDonnees() {
    const { data: offresData } = await supabase
      .from("offres")
      .select("*")
      .eq("vendeur_id", userId)
      .order("created_at", { ascending: false });
    setOffres(offresData || []);

    const ids = (offresData || []).map(o => o.id);
    if (ids.length > 0) {
      const { data: resData } = await supabase
        .from("reservations")
        .select("*, offres(nom_plat), utilisateurs(nom)")
        .in("offre_id", ids)
        .order("created_at", { ascending: false });
      setReservations(resData || []);
    } else {
      setReservations([]);
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde. Maximum 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return null;
    const ext = imageFile.name.split(".").pop();
    const fileName = `${userId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("plats")
      .upload(fileName, imageFile, { upsert: true });
    if (error) {
      toast.error("Erreur upload image : " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("plats").getPublicUrl(fileName);
    return data.publicUrl;
  }

  function detecterPosition() {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par ton navigateur");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        toast.success("📍 Position détectée !");
      },
      () => toast.error("Impossible de détecter ta position. Vérifie les permissions.")
    );
  }

  async function publierOffre(e) {
    e.preventDefault();
    if (Number(form.prix_reduit) >= Number(form.prix_normal)) {
      toast.error("Le prix réduit doit être inférieur au prix normal");
      return;
    }
    if (Number(form.quantite) <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }
    setLoading(true);

    const imageUrl = await uploadImage();

    const { error } = await supabase.from("offres").insert({
      vendeur_id: userId,
      nom_plat: form.nom_plat,
      description: form.description,
      prix_normal: Number(form.prix_normal),
      prix_reduit: Number(form.prix_reduit),
      quantite: Number(form.quantite),
      heure_limite: form.heure_limite,
      image_url: imageUrl,
      adresse: form.adresse || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    });

    if (error) {
      toast.error("Erreur lors de la publication : " + error.message);
    } else {
      toast.success("Offre publiée avec succès !");
      setForm({
        nom_plat: "", description: "",
        prix_normal: "", prix_reduit: "",
        quantite: "", heure_limite: "",
        adresse: "", latitude: "", longitude: ""
      });
      setImageFile(null);
      setImagePreview(null);
      await chargerDonnees();
      setOnglet("offres");
    }
    setLoading(false);
  }

  async function supprimerOffre(id) {
    const confirmation = window.confirm("Es-tu sûr de vouloir supprimer cette offre ?");
    if (!confirmation) return;
    await supabase.from("offres").delete().eq("id", id);
    toast.success("Offre supprimée");
    await chargerDonnees();
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const reduction = form.prix_normal && form.prix_reduit
    ? Math.round((1 - Number(form.prix_reduit) / Number(form.prix_normal)) * 100)
    : 0;

  const revenusEstimes = reservations.reduce((acc, r) => {
    const offre = offres.find(o => o.id === r.offre_id);
    return acc + (offre ? Number(offre.prix_reduit) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-base">🍽️</span>
            </div>
            <div>
              <span className="font-extrabold text-gray-800">FoodSave <span className="text-green-600">CI</span></span>
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Vendeur</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{nom || "Vendeur"}</p>
              <p className="text-xs text-gray-400">{offres.length} offre(s)</p>
            </div>
            <button onClick={deconnexion}
              className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-xl transition-all">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Offres publiées", value: offres.length, icon: "📋", color: "bg-blue-50 text-blue-600" },
            { label: "Réservations", value: reservations.length, icon: "✅", color: "bg-green-50 text-green-600" },
            { label: "Plats restants", value: offres.reduce((a, o) => a + Number(o.quantite), 0), icon: "🍱", color: "bg-orange-50 text-orange-600" },
            { label: "Revenus estimés", value: revenusEstimes.toLocaleString("fr-FR") + " FCFA", icon: "💰", color: "bg-purple-50 text-purple-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ONGLETS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "offres", label: "📋 Mes offres" },
            { id: "ajouter", label: "➕ Publier une offre" },
            { id: "reservations", label: "✅ Réservations" },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${onglet === o.id
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* ONGLET : MES OFFRES */}
        {onglet === "offres" && (
          <div>
            {offres.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <p className="text-5xl mb-4">🍽️</p>
                <p className="text-gray-500 font-medium">Aucune offre publiée pour l'instant</p>
                <button onClick={() => setOnglet("ajouter")}
                  className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-all">
                  Publier ma première offre
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offres.map(o => {
                  const red = Math.round((1 - o.prix_reduit / o.prix_normal) * 100);
                  return (
                    <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                      {o.image_url ? (
                        <img src={o.image_url} alt={o.nom_plat} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-orange-50 flex items-center justify-center">
                          <span className="text-5xl">🍽️</span>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{o.nom_plat}</h3>
                            <p className="text-gray-400 text-sm">{o.description}</p>
                            {o.adresse && (
                              <p className="text-gray-400 text-xs mt-1">📍 {o.adresse}</p>
                            )}
                          </div>
                          <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">-{red}%</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="text-gray-300 line-through text-sm">{Number(o.prix_normal).toLocaleString("fr-FR")} FCFA</span>
                            <span className="text-orange-500 font-extrabold text-xl ml-2">{Number(o.prix_reduit).toLocaleString("fr-FR")} FCFA</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">⏰ {o.heure_limite}</p>
                            <p className="text-xs text-gray-400">📦 {o.quantite} restant(s)</p>
                          </div>
                        </div>
                        <button onClick={() => supprimerOffre(o.id)}
                          className="mt-4 w-full text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 py-2 rounded-xl transition-all">
                          Supprimer cette offre
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ONGLET : PUBLIER */}
        {onglet === "ajouter" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Publier une nouvelle offre</h2>
            <form onSubmit={publierOffre} className="flex flex-col gap-4">

              {/* Upload image */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Photo du plat</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-orange-300 transition-all cursor-pointer"
                  onClick={() => document.getElementById("imageInput").click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="py-6">
                      <p className="text-4xl mb-2">📸</p>
                      <p className="text-gray-400 text-sm">Clique pour ajouter une photo</p>
                      <p className="text-gray-300 text-xs mt-1">JPG, PNG — Max 5MB</p>
                    </div>
                  )}
                </div>
                <input id="imageInput" type="file" accept="image/*"
                  className="hidden" onChange={handleImageChange} />
                {imagePreview && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600">
                    Supprimer la photo
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Nom du plat *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                  placeholder="Ex: Riz sauce graine + poisson"
                  value={form.nom_plat}
                  onChange={e => setForm({ ...form, nom_plat: e.target.value })} required />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Description</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                  placeholder="Ex: Plat complet avec salade et boisson"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Prix normal (FCFA) *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    type="number" min="0" placeholder="2000"
                    value={form.prix_normal}
                    onChange={e => setForm({ ...form, prix_normal: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Prix réduit (FCFA) *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    type="number" min="0" placeholder="1000"
                    value={form.prix_reduit}
                    onChange={e => setForm({ ...form, prix_reduit: e.target.value })} required />
                </div>
              </div>

              {reduction > 0 && reduction <= 100 && (
                <div className={`border rounded-xl p-3 text-center ${reduction > 70 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                  <p className={`font-semibold text-sm ${reduction > 70 ? "text-green-700" : "text-orange-700"}`}>
                    🎉 Tu offres <strong>{reduction}%</strong> de réduction !
                  </p>
                </div>
              )}
              {reduction < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-red-600 font-semibold text-sm">⚠️ Le prix réduit doit être inférieur au prix normal</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Quantité *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    type="number" min="1" placeholder="5"
                    value={form.quantite}
                    onChange={e => setForm({ ...form, quantite: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Heure limite *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    type="time"
                    value={form.heure_limite}
                    onChange={e => setForm({ ...form, heure_limite: e.target.value })} required />
                </div>
              </div>

              {/* LOCALISATION */}
              <div className="border-t border-gray-100 pt-4">
                <label className="text-sm font-medium text-gray-600 mb-3 block">
                  📍 Localisation du restaurant
                </label>

                <div className="mb-3">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    placeholder="Ex: Cocody, Abidjan"
                    value={form.adresse}
                    onChange={e => setForm({ ...form, adresse: e.target.value })}
                  />
                </div>

                <button type="button" onClick={detecterPosition}
                  className="w-full border-2 border-orange-200 text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-xl transition-all text-sm">
                  📍 Détecter ma position automatiquement
                </button>

                {form.latitude && form.longitude && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-green-700 text-sm font-semibold">
                      ✅ Position enregistrée : {form.latitude}, {form.longitude}
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading || reduction < 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg transition-all shadow-lg disabled:opacity-50 mt-2">
                {loading ? "Publication en cours..." : "Publier l'offre →"}
              </button>
            </form>
          </div>
        )}

        {/* ONGLET : RESERVATIONS */}
        {onglet === "reservations" && (
          <div>
            {reservations.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-500 font-medium">Aucune réservation pour l'instant</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reservations.map(r => {
                  const offre = offres.find(o => o.id === r.offre_id);
                  return (
                    <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800">{offre?.nom_plat || "Plat inconnu"}</p>
                          <p className="text-gray-400 text-sm mt-0.5">Client : {r.utilisateurs?.nom || "Étudiant"}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {new Date(r.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">Code retrait</p>
                          <div className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl text-sm tracking-wider">
                            {r.code_retrait}
                          </div>
                          {offre && (
                            <p className="text-orange-500 font-bold text-sm mt-1">
                              {Number(offre.prix_reduit).toLocaleString("fr-FR")} FCFA
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}