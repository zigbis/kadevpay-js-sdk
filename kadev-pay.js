/**
 * Kadev Pay SDK - Passerelle de paiement Mobile Money et Carte
 * Version: 1.0.0
 */
(function() {
    const KADEV_API_URL = "https://pay.kadev.ci/api/v1/checkout/sessions";
    const PAYSTACK_JS_URL = "https://js.paystack.co/v1/inline.js";
    const LOGO_URL = "https://pay.kadev.ci/logo_kadev.png"; 

    const KadevPay = {
        /**
         * Lance la session de paiement
         * @param {Object} config - Configuration du paiement (public_key, amount, email, etc.)
         */
        checkout: async function(config) {
            this._showLoader();

            let isSuccess = false;
            const userConfig = { ...config };

            try {
                await this._loadScript(PAYSTACK_JS_URL);

                const response = await fetch(KADEV_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userConfig.public_key
                    },
                    body: JSON.stringify({
                        amount: userConfig.amount,
                        email: userConfig.email,
                        name: userConfig.name || "",
                        phone: userConfig.phone || "",
                        method: userConfig.method || "momo",
                        metadata: userConfig.metadata || {}
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.data) {
                    throw new Error(result.message || "Erreur lors de l'initialisation Kadev Pay");
                }

                const data = result.data;
                let selectedChannels = ['mobile_money']; // Par défaut
                if (data.method === 'card') {
                    selectedChannels = ['card'];
                }
                
                this._hideLoader();
                
                // Préparation de la fenêtre Paystack
                const handler = PaystackPop.setup({
                    key: data.paystack_public_key,
                    email: userConfig.email,
                    amount: data.total_to_pay_kobo,
                    ref: data.reference,
                    currency: "XOF",
                    bearer: "account",
                    channels: selectedChannels,
                    split: {
                        type: "flat",
                        bearer_type: "account",
                        subaccounts: [
                            {
                                subaccount: data.subaccount, 
                                share: data.share 
                            }
                        ]
                    },
                    metadata: {
                        custom_fields: [
                            {
                                display_name: "Full Name",
                                variable_name: "full_name",
                                value: userConfig.name || ""
                            },
                            {
                                display_name: "Phone Number",
                                variable_name: "phone_number",
                                value: userConfig.phone || ""
                            }
                        ]
                    },
                    callback: function(response) {
                        console.log("PAIEMENT OK :", response);
                        isSuccess = true;

                        if (response.status === "success") {
                            if (userConfig.callback_url) {
                                const separator = userConfig.callback_url.includes('?') ? '&' : '?';
                                const url = userConfig.callback_url + separator + "reference=" + response.reference;

                                console.log("REDIRECTION VERS :", url);

                                setTimeout(() => {
                                    try {
                                        window.top.location.href = url;
                                    } catch (e) {
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.target = "_top";
                                        document.body.appendChild(a);
                                        a.click();
                                    }
                                }, 300);
                            } 
                            else if (userConfig.onSuccess) {
                                userConfig.onSuccess(response);
                            }
                        }
                    },
                    onClose: function() {
                        if (!isSuccess) {
                            console.log("Paiement fermé sans succès");
                            if (userConfig.onClose) userConfig.onClose();
                        }
                    }
                });

                handler.openIframe();

            } catch (error) {
                this._hideLoader();
                console.error("KadevPay Error:", error);
                alert("Erreur de paiement : " + error.message);
            }
        },

        _loadScript: function(url) {
            return new Promise((resolve, reject) => {
                if (window.PaystackPop) return resolve();

                const s = document.createElement('script');
                s.src = url;
                s.onload = resolve;
                s.onerror = () => reject(new Error("Impossible de charger le module de paiement"));
                document.head.appendChild(s);
            });
        },

        _showLoader: function() {
            if (document.getElementById('kadev-loader')) return;

            const loader = document.createElement('div');
            loader.id = 'kadev-loader';
            loader.style = `
                position:fixed;
                top:0;
                left:0;
                width:100%;
                height:100%;
                background:#ffffff;
                z-index:2147483647;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                padding:20px;
            `;

            loader.innerHTML = `
                <img src="${LOGO_URL}" style="max-width:220px; margin-bottom:40px;">
                <div style="border:3px solid #f3f3f3; border-top:3px solid #dd0c17; border-radius:50%; width:35px; height:35px; animation:kadev-spin 1s linear infinite;"></div>
                <p style="margin-top:25px; font-family:sans-serif; color:#333;">Sécurisation de la transaction...</p>
                <style>
                    @keyframes kadev-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;

            document.body.appendChild(loader);
        },

        _hideLoader: function() {
            const loader = document.getElementById('kadev-loader');
            if (loader) loader.remove();
        }
    };

    window.KadevPay = KadevPay;
})();
