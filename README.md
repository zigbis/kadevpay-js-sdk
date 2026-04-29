# 🚀 Kadev Pay SDK - Paiement Mobile Money & Carte en Côte d'Ivoire

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Pays](https://img.shields.io/badge/Pays-Côte_d'Ivoire-orange.svg)
![Paiements](https://img.shields.io/badge/Paiements-Mobile_Money_%7C_Carte-success.svg)

**Kadev Pay** est la passerelle de paiement la plus simple pour les développeurs souhaitant intégrer les paiements locaux (Orange Money, MTN, Moov, Wave) et internationaux (Visa, Mastercard) dans leurs applications web et mobiles en Côte d'Ivoire.

🔗 **[Lire la documentation officielle complète](https://pay.kadev.ci/developer-documentation)**

---

## ✨ Pourquoi Kadev Pay ?

- **Intégration en 5 minutes :** Un seul SDK pour gérer l'affichage, la sécurité et la redirection.
- **Transparence :** Les frais les plus compétitifs du marché.
- **Webhooks fiables :** Validation côté serveur sécurisée pour mettre à jour vos bases de données.
- **Paiements fractionnés (Split) :** Idéal pour les marketplaces.

---

## 💻 Installation & Démarrage Rapide (Frontend)

Vous n'avez pas besoin d'installer de lourdes librairies. Ajoutez simplement notre script sécurisé sur votre page HTML ou dans votre application React/Vite.

```html
<script src="https://pay.kadev.ci/js/v1/kadev-pay.js"></script>
```

### Lancer un paiement avec le SDK

Associez ce code au clic de votre bouton de paiement. Remplacez la clé publique par celle disponible dans votre dashboard Kadev Pay.

```javascript
function payerAvecKadev() {
    KadevPay.checkout({
        public_key: "kdvp_test_VOTRE_CLE_PUBLIQUE",
        amount: 5000,                          // Montant en FCFA
        email: "client@email.com",             // Email du client
        name: "Jean Dupont",                   // Nom du client (Optionnel)
        phone: "0102030405",                   // Téléphone (Optionnel)
        method: "momo",                        // "momo" (Mobile Money) ou "card" (Carte)
        
        // URL de redirection après succès
        callback_url: "https://votre-site.com/commande-reussie",
        
        // Données supplémentaires récupérables via Webhook
        metadata: {
            cart_id: "CMD-9982"
        },
        
        onClose: function() {
            console.log("Le client a annulé le paiement.");
        }
    });
}
```

---

## 🔒 Validation de la transaction (Backend PHP)

Il est indispensable de valider la transaction sur votre serveur via nos Webhooks sécurisés.

### Exemple de vérification de signature :

```php
<?php
// Votre secret webhook disponible sur le dashboard
$webhook_secret = "VOTRE_SECRET_WEBHOOK"; 

$signature = $_SERVER['HTTP_X_KADEVPAY_SIGNATURE'] ?? '';
$payload = file_get_contents('php://input');

// Vérification de l'authenticité
$computed_signature = hash_hmac('sha512', $payload, $webhook_secret);

if (hash_equals($computed_signature, $signature)) {
    $event = json_decode($payload, true);
    
    if ($event['event'] === 'payment.success' && $event['data']['status'] === 'paid') {
        $reference = $event['data']['reference'];
        
        // ✅ Paiement validé ! Mettez à jour votre commande ici.
        // update_order_status($reference, 'payé');
        
        http_response_code(200);
        echo "Signal reçu";
    }
} else {
    http_response_code(401);
    echo "Signature invalide";
}
?>
```

---

## 🔌 Plugins & Extensions

Vous utilisez un CMS ? Intégrez Kadev Pay sans coder :
👉 **[Télécharger le Plugin Kadev Pay pour WooCommerce](https://pay.kadev.ci/developer-documentation#plugins)**

---

## 📞 Support & Contact

Besoin d'aide ? L'équipe Kadev est basée à Abidjan et vous accompagne.
- **Site officiel:** [pay.kadev.ci](https://pay.kadev.ci)
- **Support:** [Support technique](https://pay.kadev.ci/support)
- **Inscription:** [Créer un compte gratuit](https://pay.kadev.ci/signup)
