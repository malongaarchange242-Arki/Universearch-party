# 🚀 QUICKSTART - Mise à Jour Paiement MoMo

## ⏱️ Temps Requis: 10 minutes

---

## 🎯 Ce Qui a Changé

✨ **Deux champs essentiels ajoutés au formulaire de paiement:**
- 📝 Nom / Prénom du client
- 🔐 ID Transaction MoMo

**Impact:** Système de paiement maintenant complet et sécurisé ✅

---

## ⚡ Actions à Faire

### **ÉTAPE 1: Migration Base de Données (2 min)**

Allez sur **Supabase Dashboard**:

1. Connectez-vous → `https://supabase.com`
2. Sélectionnez votre projet
3. Allez à `SQL Editor` (en bas à gauche)
4. Créez une `New Query`
5. Collez ce code:

```sql
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "customerName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "transactionId" VARCHAR(255);

CREATE INDEX IF NOT EXISTS "idx_payments_transactionId" ON "payments"("transactionId");
CREATE INDEX IF NOT EXISTS "idx_payments_phoneNumber" ON "payments"("phoneNumber");
```

6. Cliquez sur ▶️ **Exécuter**
7. ✅ Message de succès = OK

---

### **ÉTAPE 2: Redémarrer Serveur (3 min)**

```bash
# Terminal

# 1. Arrêtez le serveur actuel (Ctrl+C)

# 2. Recompiler
npm run build

# 3. Redémarrer
npm run dev

# ✅ Attendu dans les logs:
# ✅ Supabase connected successfully
```

---

### **ÉTAPE 3: Tester le Formulaire (5 min)**

**Dans le navigateur:**

1. Ouvrez `Party.html`
2. Cliquez sur **"Réserver mon pass"**
3. Remplissez le profil
4. Allez au paiement

**Vérifiez que vous voyez:**
- ✅ Champ "Nom / Prénom"
- ✅ Champ "ID Transaction"
- ✅ Message ⚠️ "Important"

**Testez la validation:**
- Remplissez le nom → Aucune erreur
- Laissez vide → "Veuillez entrer votre nom / prénom"
- Laissez ID Transaction vide → "Veuillez entrer l'ID de transaction"

---

## 📊 Vérification Rapidement

### ✅ Checklist (2 min)

- [ ] Migration SQL exécutée sans erreurs
- [ ] Serveur redémarré avec `npm run dev`
- [ ] Formulaire affiche les 2 nouveaux champs
- [ ] Validation fonctionne (messages d'erreur)
- [ ] Pas d'erreurs dans la Console du navigateur (F12)

### 🎉 Tous les checkboxes coché?

**BRAVO! Le système est prêt! 🚀**

---

## 📞 Besoin d'Aide?

### ❌ Erreur: "Column does not exist"
→ Migration SQL non appliquée  
→ Solution: Revenez à Supabase et exécutez le SQL

### ❌ Erreur TypeScript
→ Ancien cache  
→ Solution: `npm run build`

### ❌ Formulaire n'affiche pas les champs
→ Cache du navigateur  
→ Solution: Ctrl+Shift+Delete → Vider cache → F5

### ❌ Problème MoMo
→ Vérifiez `.env` MOMO_* variables  
→ Vérifiez les logs serveur pour détails

---

## 📚 Documentation Complète

Pour des détails complets:

- 📋 **CHANGELOG_PAYMENT_UPDATE.md** - Toutes les modifications
- 🎯 **IMPLEMENTATION_GUIDE.md** - Guide étape par étape détaillé
- 🎨 **UI_COMPARISON.md** - Comparaison visuelle avant/après
- 📝 **FILES_MODIFIED_SUMMARY.md** - Résumé de tous les fichiers

---

## 🎯 Format de Données (Info pour Dev)

```javascript
// Frontend envoie ceci:
{
  name: "Jean Dupont",           // ✨ NOUVEAU
  phone: "+237690123456",
  quantity: 1,
  amount: 2500,
  transaction_id: "MOMO123456"   // ✨ NOUVEAU
}

// Backend stocke ceci:
{
  customerName: "Jean Dupont",   // ✨ NOUVEAU
  phoneNumber: "+237690123456",
  quantity: 1,
  amount: 2500,
  transactionId: "MOMO123456"    // ✨ NOUVEAU
}
```

---

## 🔍 Commande de Test API (Optional)

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+237690123456",
    "quantity": 1,
    "amount": 2500,
    "transaction_id": "TEST123456"
  }'
```

---

## 🎉 C'est Fini!

Une fois les 3 étapes faites:
- ✅ Backend mis à jour
- ✅ Frontend amélioré  
- ✅ Base de données synchronisée
- ✅ Système sécurisé et complet

**Votre système de paiement est maintenant prêt! 🚀**

---

**Questions?** Consultez les autres fichiers MD du projet.  
**Version:** 2.5.0  
**Date:** 22 Mars 2026
