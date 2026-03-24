# PassEvent API - Guide de Requêtes HTTP

## 🧪 Collection de requêtes d'exemple

Vous pouvez importer ces requêtes dans Postman, Insomnia ou utiliser les commandes curl.

### Base URL
```
http://localhost:3000
```

---

## 🏥 Health Check

### Vérifier que le serveur fonctionne

```bash
curl -X GET http://localhost:3000/health
```

**Réponse:**
```json
{
  "status": "ok",
  "message": "PassEvent API is running",
  "timestamp": "2024-01-15T10:30:00.123Z"
}
```

---

## 👤 AUTHENTIFICATION (Auth Module)

### 1. Enregistrer un nouvel utilisateur

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250789123456"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250789123456",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Codes de réponse:**
- `201`: Utilisateur créé avec succès
- `400`: Erreur de validation (email existant, format invalide, etc.)

---

### 2. Login / S'authentifier

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250789123456"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250789123456"
  }
}
```

**Notes:**
- Si l'utilisateur existe: retourne l'utilisateur existant
- Si l'utilisateur n'existe pas: crée un nouvel utilisateur et le retourne

---

### 3. Récupérer le profil d'un utilisateur

```bash
curl -X GET http://localhost:3000/auth/profile/550e8400-e29b-41d4-a716-446655440000
```

**Réponse:**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250789123456",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📅 ÉVÉNEMENTS (Events Module)

### 1. Créer un événement

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Summit 2024",
    "description": "La plus grande conférence technologique",
    "price": 25000,
    "date": "2024-04-20T09:00:00Z",
    "location": "Kigali Convention Centre",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Notes:**
- `price` est en centimes (25000 = 250 EUR)
- `date` doit être dans le futur
- `createdBy` est l'ID de l'utilisateur créateur

**Réponse:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Tech Summit 2024",
    "description": "La plus grande conférence technologique",
    "price": 25000,
    "date": "2024-04-20T09:00:00.000Z",
    "location": "Kigali Convention Centre",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Lister tous les événements

```bash
curl -X GET 'http://localhost:3000/events?page=1&limit=10'
```

**Réponse:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Tech Summit 2024",
      "price": 25000,
      "date": "2024-04-20T09:00:00.000Z",
      "location": "Kigali Convention Centre",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

### 3. Récupérer un événement spécifique

```bash
curl -X GET http://localhost:3000/events/660e8400-e29b-41d4-a716-446655440001
```

**Réponse:**
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Tech Summit 2024",
    "description": "La plus grande conférence technologique",
    "price": 25000,
    "date": "2024-04-20T09:00:00.000Z",
    "location": "Kigali Convention Centre",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Événements créés par un utilisateur

```bash
curl -X GET http://localhost:3000/events/creator/550e8400-e29b-41d4-a716-446655440000
```

**Réponse:**
```json
{
  "success": true,
  "message": "User events retrieved successfully",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Tech Summit 2024",
      "price": 25000,
      "date": "2024-04-20T09:00:00.000Z",
      "location": "Kigali Convention Centre",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

---

### 5. Modifier un événement

```bash
curl -X PUT http://localhost:3000/events/660e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Summit 2024 - Updated",
    "price": 30000
  }'
```

**Notes:**
- Seuls les champs modifiés sont requis
- Ne peut pas mettre à jour la date dans le passé

---

### 6. Supprimer un événement

```bash
curl -X DELETE http://localhost:3000/events/660e8400-e29b-41d4-a716-446655440001
```

---

## 💳 PAIEMENTS (Payments Module)

### 1. Initier un paiement (appel MTN MoMo)

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "660e8400-e29b-41d4-a716-446655440001",
    "amount": 25000,
    "phoneNumber": "250789123456"
  }'
```

**Notes:**
- `amount` en centimes
- `phoneNumber` numéro de téléphone du client (format: 250xxxxxxxxx ou +250xxxxxxxxx)
- MTN MoMo enverra un USSD au client

**Réponse:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "660e8400-e29b-41d4-a716-446655440001",
    "amount": 25000,
    "status": "PENDING",
    "momoReference": "PASS_1705316400000_abc123def",
    "message": "Please complete the payment on your phone",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Vérifier le statut du paiement (Polling)

```bash
# Vérifie le statut toutes les 5 secondes pendant 2 minutes
curl -X GET http://localhost:3000/payments/status/PASS_1705316400000_abc123def
```

**Réponse (statut PENDING):**
```json
{
  "success": true,
  "message": "Payment status: PENDING",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "PENDING",
    "momoReference": "PASS_1705316400000_abc123def"
  }
}
```

**Réponse (statut SUCCESSFUL):**
```json
{
  "success": true,
  "message": "Payment successful! Ticket has been generated.",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "SUCCESSFUL",
    "momoReference": "PASS_1705316400000_abc123def",
    "amount": 25000,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Récupérer un paiement spécifique

```bash
curl -X GET http://localhost:3000/payments/770e8400-e29b-41d4-a716-446655440002
```

---

### 4. Paiements d'un utilisateur

```bash
curl -X GET http://localhost:3000/payments/user/550e8400-e29b-41d4-a716-446655440000
```

**Réponse:**
```json
{
  "success": true,
  "message": "User payments retrieved successfully",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "eventId": "660e8400-e29b-41d4-a716-446655440001",
      "amount": 25000,
      "status": "SUCCESSFUL",
      "momoReference": "PASS_1705316400000_abc123def",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🎫 TICKETS (Tickets Module)

### 1. Récupérer un ticket

```bash
curl -X GET http://localhost:3000/tickets/880e8400-e29b-41d4-a716-446655440003
```

**Réponse:**
```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "660e8400-e29b-41d4-a716-446655440001",
    "paymentId": "770e8400-e29b-41d4-a716-446655440002",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAA...",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:01.000Z"
  }
}
```

---

### 2. Tickets d'un utilisateur

```bash
curl -X GET http://localhost:3000/tickets/user/550e8400-e29b-41d4-a716-446655440000
```

**Réponse:**
```json
{
  "success": true,
  "message": "User tickets retrieved successfully",
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "eventId": "660e8400-e29b-41d4-a716-446655440001",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:01.000Z"
    }
  ]
}
```

---

### 3. Tickets d'un événement

```bash
curl -X GET http://localhost:3000/tickets/event/660e8400-e29b-41d4-a716-446655440001
```

---

### 4. Marquer un ticket comme utilisé (à l'entrée)

```bash
curl -X POST http://localhost:3000/tickets/880e8400-e29b-41d4-a716-446655440003/use \
  -H "Content-Type: application/json"
```

**Réponse:**
```json
{
  "success": true,
  "message": "Ticket marked as used",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "status": "USED",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "eventId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

---

## 🔄 Scénario complet d'utilisation

### Étape 1: Enregistrer l'utilisateur

```bash
USER_ID=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "phone": "+250789000000"
  }' | jq -r '.data.id')

echo "User ID: $USER_ID"
```

### Étape 2: Créer un événement

```bash
EVENT_ID=$(curl -s -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Amazing Concert\",
    \"price\": 50000,
    \"date\": \"2024-12-25T19:00:00Z\",
    \"location\": \"Kigali Arena\",
    \"createdBy\": \"$USER_ID\"
  }" | jq -r '.data.id')

echo "Event ID: $EVENT_ID"
```

### Étape 3: Initier le paiement

```bash
PAYMENT=$(curl -s -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"eventId\": \"$EVENT_ID\",
    \"amount\": 50000,
    \"phoneNumber\": \"250789000000\"
  }")

PAYMENT_REF=$(echo $PAYMENT | jq -r '.data.momoReference')
echo "Payment Reference: $PAYMENT_REF"
```

### Étape 4: Vérifier le statut du paiement

```bash
# Continuez à vérifier jusqu'à SUCCESSFUL
for i in {1..12}; do
  curl -s -X GET http://localhost:3000/payments/status/$PAYMENT_REF | jq '.data.status'
  sleep 5
done
```

### Étape 5: Récupérer les tickets

```bash
curl -X GET http://localhost:3000/tickets/user/$USER_ID | jq '.'
```

---

## 📌 Codes d'erreur communs

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing required fields | Paramètres manquants |
| 400 | User not found | L'utilisateur n'existe pas |
| 400 | Event not found | L'événement n'existe pas |
| 400 | User with this email already exists | Email dupliqué |
| 400 | Event date cannot be in the past | Date invalide |
| 404 | Payment not found | Paiement introuvable |
| 404 | Ticket not found | Ticket introuvable |
| 500 | Internal server error | Erreur serveur |

---

## 💡 Tips d'utilisation

1. **Testez en local d'abord** avec `npm run dev`
2. **Utilisez Postman** pour une meilleure UI: File → Import → Collez les requêtes
3. **Gardez les IDs** des utilisateurs/événements/paiements pour les tester facilement
4. **Vérifiez les logs** du serveur en `npm run dev` pour comprendre ce qui se passe
5. **Utilisez jq** pour parser JSON dans le terminal: `curl ... | jq '.'`

Bon test ! 🎉
