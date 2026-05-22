const CLE_RESEND = "COLLE_TA_CLE_RESEND_ICI";

export async function envoyerEmailReservation({ emailEtudiant, nomEtudiant, nomPlat, codeRetrait, prixReduit, heureLimit }) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLE_RESEND}`
      },
      body: JSON.stringify({
        from: "FoodSave CI <onboarding@resend.dev>",
        to: emailEtudiant,
        subject: "✅ Ta réservation FoodSave CI est confirmée !",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #16a34a; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🍱 FoodSave CI</h1>
              <p style="color: #bbf7d0; margin: 8px 0 0;">Réservation confirmée !</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <p style="color: #374151; font-size: 16px;">Bonjour <strong>${nomEtudiant}</strong> 👋</p>
              <p style="color: #6b7280;">Ta réservation a bien été enregistrée !</p>

              <div style="background: white; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #111827; margin: 0 0 12px;">${nomPlat}</h2>
                <p style="color: #6b7280; margin: 4px 0;">💰 Prix : <strong style="color: #f97316;">${prixReduit} FCFA</strong></p>
                <p style="color: #6b7280; margin: 4px 0;">⏰ À récupérer avant : <strong>${heureLimit}</strong></p>
              </div>

              <div style="background: #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #bbf7d0; margin: 0 0 8px; font-size: 14px;">Ton code de retrait</p>
                <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">${codeRetrait}</p>
              </div>

              <p style="color: #6b7280; font-size: 14px;">Présente ce code au vendeur pour récupérer ton repas. Bonne dégustation ! 😋</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © 2026 FoodSave CI — Côte d'Ivoire 🇨🇮
              </p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Erreur Resend:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return false;
  }
}

export async function envoyerEmailVendeur({ emailVendeur, nomVendeur, nomPlat, nomEtudiant, codeRetrait, prixReduit }) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLE_RESEND}`
      },
      body: JSON.stringify({
        from: "FoodSave CI <onboarding@resend.dev>",
        to: emailVendeur,
        subject: "🔔 Nouvelle réservation sur FoodSave CI !",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f97316; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ FoodSave CI</h1>
              <p style="color: #fed7aa; margin: 8px 0 0;">Nouvelle réservation !</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <p style="color: #374151; font-size: 16px;">Bonjour <strong>${nomVendeur}</strong> 👋</p>
              <p style="color: #6b7280;">Un étudiant vient de réserver un de tes plats !</p>

              <div style="background: white; border: 2px solid #f97316; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="color: #6b7280; margin: 4px 0;">🍱 Plat : <strong>${nomPlat}</strong></p>
                <p style="color: #6b7280; margin: 4px 0;">🎓 Étudiant : <strong>${nomEtudiant}</strong></p>
                <p style="color: #6b7280; margin: 4px 0;">💰 Montant : <strong style="color: #f97316;">${prixReduit} FCFA</strong></p>
              </div>

              <div style="background: #f97316; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #fed7aa; margin: 0 0 8px; font-size: 14px;">Code de retrait à valider</p>
                <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">${codeRetrait}</p>
              </div>

              <p style="color: #6b7280; font-size: 14px;">L'étudiant présentera ce code lors du retrait. Prépare sa commande ! 🚀</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © 2026 FoodSave CI — Côte d'Ivoire 🇨🇮
              </p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Erreur Resend vendeur:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erreur envoi email vendeur:", err);
    return false;
  }
}