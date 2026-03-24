## 🎯 Guide d'Implémentation - Mise à Jour Paiement MoMo

### ✅ Étapes Complétées

Le code est maintenant à jour avec les deux champs essentiels:
- ✅ **Nom / Prénom du client**
- ✅ **ID Transaction MoMo**

### 🚀 Prochaines Étapes d'Implémentation

---

## **ÉTAPE 1: Appliquer la Migration Base de Données** ⚡

### Option A: Supabase Dashboard (Recommandé)

1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Allez à l'onglet **SQL** (en bas à gauche)
4. Créez une nouvelle requête
5. Copiez et exécutez le contenu de `migrations/add_payment_fields.sql`:

```sql
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "customerName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "transactionId" VARCHAR(255);

CREATE INDEX IF NOT EXISTS "idx_payments_transactionId" ON "payments"("transactionId");
CREATE INDEX IF NOT EXISTS "idx_payments_phoneNumber" ON "payments"("phoneNumber");
```

6. Cliquez sur **Exécuter** (Play button)
7. Vérifiez le message de confirmation

### Option B: En Ligne de Commande

```bash
# (Si vous avez accès à votre base de données PostgreSQL)
psql -U user -d database_name -f migrations/add_payment_fields.sql
```

---

## **ÉTAPE 2: Redémarrez le Serveur**

```bash
# 1. Arrêtez le serveur actuel (Ctrl+C)
cd "d:\New projet pass'event"

# 2. Installez les dépendances (au cas où)
npm install

# 3. Recompilez
npm run build  # ✅ Devrait être sans erreurs

# 4. Démarrez le serveur
npm run dev
```

### Vérification:
Dans les logs, vous devriez voir:
```
✅ Supabase connected successfully
✅ Payment service initialized
```

---

## **ÉTAPE 3: Testez le Formulaire**

### Test 1: Frontend UI
1. Ouvrez `Party.html` dans un navigateur
2. Cliquez sur **"Réserver mon pass"**
3. Remplissez le formulaire de profil
4. Allez à **"Paiement MTN MoMo"**
5. Vérifiez que les nouveaux champs apparaissent:
   - ✅ Champ "Nom / Prénom"
   - ✅ Champ "ID Transaction"
   - ✅ Message d'avertissement ⚠️

### Test 2: Validation Frontend
```javascript
// Dans la Console du Navigateur (F12), testez:

// Essayez de valider sans remplir les champs
// Vous devriez voir: "Veuillez entrer votre nom / prénom"

// Essayez avec un ID Transaction vide
// Vous devriez voir: "Veuillez entrer l'ID de transaction"
```

---

## **ÉTAPE 3: Testez l'API Backend**

### Test 1: Créer un Paiement

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "phone": "+237690123456",
    "quantity": 1,
    "amount": 2500,
    "transaction_id": "MOMO123456"
  }'
```

### Réponse Attendue:
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "id": "uuid-here",
    "status": "PENDING",
    "momoReference": "MOMO-ref-123",
    "customerName": "Jean Dupont",
    "phoneNumber": "+237690123456",
    "quantity": 1,
    "transactionId": "MOMO123456",
    "createdAt": "2026-03-22T..."
  }
}
```

### Test 2: Vérifier le Paiement en Base de Données

Allez à Supabase → **Table Editor**:
1. Sélectionnez la table `payments`
2. Vérifiez que les nouvelles colonnes existent:
   - `customerName` ✅
   - `phoneNumber` ✅
   - `quantity` ✅
   - `transactionId` ✅
3. Vérifiez que votre test est enregistré

---

## **ÉTAPE 4: Configuration MoMo (Optionnel)**

Si vous utilisez l'API MoMo réelle, assurez-vous que:

```env
# .env
MOMO_API_USER=your-user
MOMO_API_KEY=your-key
MOMO_SUBSCRIPTION_KEY=your-subscription-key
MOMO_ENVIRONMENT=sandbox # ou production
MOMO_COLLECTION_CURRENCY=XAF
```

Puis testez:
```bash
npm run dev
# Vérifiez les logs pour les appels MoMo
```

---

## **ÉTAPE 5: Tester le Flow Complet**

1. **Frontend**: Remplissez le formulaire:
   - Nom: "Antoine Kabuti"
   - Numéro: "6XXXXXXXX"
   - Nombre de tickets: 2
   - ID Transaction: "MOMO8901234"

2. **Cliquez**: "Confirmer paiement"

3. **Observez**:
   - Les logs du serveur montrent l'appel MoMo
   - La base de données enregistre les données
   - L'UI affiche l'état du paiement

4. **Vérifiez la Base de Données**:
   ```
   Tableau "payments" contient:
   - customerName: "Antoine Kabuti"
   - phoneNumber: "+237690123456"
   - quantity: 2
   - transactionId: "MOMO8901234"
   - amount: 5000 (2 × 2500)
   ```

---

## **ÉTAPE 6: Déploiement en Production**

### Avant de déployer:

```bash
# 1. Build final
npm run build
# ✅ Aucune erreur TypeScript

# 2. Tests
npm run test  # (si configuré)

# 3. Vérification des types
npx tsc --noEmit

# 4. Commit les changements
git add -A
git commit -m "feat: add customer name and transaction ID to payments"
```

### Déploiement:
```bash
# Sur votre serveur de production
git pull origin main
npm install
npm run build
npm start
```

---

## 🔍 Vérification des Erreurs Courantes

### Erreur: "Column <name> does not exist"
- **Cause**: Migration SQL non appliquée
- **Solution**: Allez à Supabase → SQL → Exécutez `migrations/add_payment_fields.sql`

### Erreur: "Property 'customerName' does not exist"
- **Cause**: TypeScript non recompilé
- **Solution**: `npm run build`

### Erreur: "Type mismatch on phoneNumber"
- **Cause**: Ancien code cache
- **Solution**: Supprimez `dist/` et refaites `npm run build`

---

## 📊 Checklist Finale

Avant de considérer la mise en jour comme complète:

- [ ] ✅ Migration SQL appliquée (pas d'erreurs)
- [ ] ✅ Serveur redémarré (`npm run dev`)
- [ ] ✅ Formulaire HTML affiches les 2 nouveaux champs
- [ ] ✅ Validation frontend fonctionne (messages d'erreur)
- [ ] ✅ API POST `/payments` accepte les nouveaux champs
- [ ] ✅ Base de données enregistre les données
- [ ] ✅ Logs du serveur montrent les valeurs correctes
- [ ] ✅ Test bout-en-bout réussi

---

## 📞 Besoin d'Aide?

### Questions Fréquentes:

**Q: Où voir les logs du serveur?**
A: Terminal où vous avez lancé `npm run dev`

**Q: Comment vérifier la base de données?**
A: Supabase Dashboard → Table Editor → Sélectionnez "payments"

**Q: Le navigateur montre une erreur?**
A: Ouvrez la Console (F12) et cherchez les erreurs JavaScript

**Q: Le serveur redémarre tout seul?**
A: C'est normal avec `npm run dev` (hot reload)

---

## 🎉 Succès!

Une fois tous les tests passés, votre système de paiement est maintenant:
- ✅ **Sécurisé** (vérification d'ID Transaction)
- ✅ **Traçable** (nom du client enregistré)
- ✅ **Complet** (tous les champs essentiels)
- ✅ **Utilisable** (prêt pour les utilisateurs réels)

**Bon travail! 🚀**
