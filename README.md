# PassEvent - Event Management SaaS Backend

Une plateforme SaaS complète pour la gestion d'événements avec intégration du paiement **MTN MoMo** et génération automatique de tickets avec code QR.

## 🚀 Démarrage rapide

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
# Copier le fichier .env et remplir les valeurs
cp .env.example .env

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Créer la base de données
npm run prisma:push

# 5. Démarrer le serveur
npm run dev
```

## 📋 Variables d'environnement

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pass_event"

# Server
PORT=3000
NODE_ENV=development

# MTN MoMo
MOMO_API_USER=your_api_user
MOMO_API_KEY=your_api_key
MOMO_SUBSCRIPTION_KEY=your_subscription_key
MOMO_ENVIRONMENT=sandbox
MOMO_COLLECTION_CURRENCY=EUR
MOMO_CALLBACK_URL=http://localhost:3000/payments/callback
```

## 🏗️ Structure du projet

```
pass-event/
├── src/
│   ├── modules/           # Modules métier
│   │   ├── auth/          # Authentification et gestion des utilisateurs
│   │   ├── events/        # Gestion des événements
│   │   ├── payments/      # Gestion des paiements
│   │   └── tickets/       # Gestion des tickets
│   │
│   ├── integrations/      # Intégrations externes
│   │   └── momo/          # MTN MoMo API
│   │
│   ├── config/            # Configuration
│   │   ├── env.ts         # Variables d'environnement
│   │   └── db.ts          # Connexion Prisma
│   │
│   ├── shared/            # Code partagé
│   │   ├── utils.ts       # Utilitaires
│   │   └── response.ts    # Format de réponse
│   │
│   ├── app.ts             # Configuration Fastify
│   └── server.ts          # Point d'entrée
│
├── prisma/
│   └── schema.prisma      # Schéma de base de données
│
└── package.json
```

## 📚 Architecture

### Design Pattern

- **MVC Pattern**: Controller → Service → Repository → Database
- **Injection de dépendances**: Instances créées dans les classes
- **Séparation des responsabilités**: Chaque couche a une responsabilité bien définie

### Couches

1. **Repository**: Accès direct à la base de données via Prisma
2. **Service**: Logique métier et validations
3. **Controller**: Gestion des requêtes HTTP
4. **Integrations**: Services externes (MTN MoMo)

## 🔌 API Endpoints

### Authentification

```bash
# Enregistrer un utilisateur
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+250789123456"
}

# Login/Authentification
POST /auth/login
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

# Récupérer le profil
GET /auth/profile/:userId
```

### Événements

```bash
# Créer un événement
POST /events
Content-Type: application/json

{
  "title": "Concert Beethoven",
  "description": "Un concert classique spectaculaire",
  "price": 5000,              # en cents (50.00 EUR)
  "date": "2024-04-20T19:00:00Z",
  "location": "Kigali Arena",
  "createdBy": "user_id"
}

# Lister tous les événements
GET /events?page=1&limit=10

# Récupérer un événement
GET /events/:eventId

# Événements créés par un utilisateur
GET /events/creator/:userId

# Modifier un événement
PUT /events/:eventId
Content-Type: application/json

{
  "title": "Concert Bach",
  "price": 7000
}

# Supprimer un événement
DELETE /events/:eventId
```

### Paiements

```bash
# Initier un paiement (appel MTN MoMo)
POST /payments
Content-Type: application/json

{
  "userId": "user_id",
  "eventId": "event_id",
  "amount": 5000,             # en cents
  "phoneNumber": "250789123456"
}

# Vérifier le statut du paiement (polling)
GET /payments/status/PASS_1234567890_abc123def

# Récupérer un paiement
GET /payments/:paymentId

# Paiements d'un utilisateur
GET /payments/user/:userId
```

### Tickets

```bash
# Récupérer un ticket
GET /tickets/:ticketId

# Tickets d'un utilisateur
GET /tickets/user/:userId

# Tickets d'un événement
GET /tickets/event/:eventId

# Marquer un ticket comme utilisé (validation à l'entrée)
POST /tickets/:ticketId/use
```

## 💳 Flux de paiement

```
1. Client crée une demande de paiement
   POST /payments
   ↓
2. API appelle MTN MoMo (RequestToPay)
   ↓
3. Réponse: payment record avec statut PENDING
   ↓
4. Client reçoit une notification USSD sur son téléphone
   ↓
5. Client tape le code d'accès
   ↓
6. Client ou frontend poll le statut
   GET /payments/status/:reference
   ↓
7. MTN MoMo valide le paiement
   ↓
8. Statut passe à SUCCESSFUL
   ↓
9. API crée automatiquement un ticket avec QR code
   ↓
10. Ticket disponible pour le client
    GET /tickets/user/:userId
```

## 🔒 Sécurité

- ✅ Validation des entrées
- ✅ Gestion des erreurs
- ✅ Logs des opérations sensibles
- ⚠️ JWT Not implemented (à ajouter selon vos besoins)
- ⚠️ Rate limiting (à ajouter selon vos besoins)

## 🧪 Exemples d'utilisation

### Scénario complet

```bash
# 1. Créer un utilisateur
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "phone": "+250789000000"
  }'

# Réponse: { userId: "abc123" }

# 2. Créer un événement
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Summit 2024",
    "description": "La plus grande conférence tech",
    "price": 25000,
    "date": "2024-05-15T09:00:00Z",
    "location": "Kigali Convention Centre",
    "createdBy": "abc123"
  }'

# Réponse: { eventId: "evt456" }

# 3. Demander le paiement
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "abc123",
    "eventId": "evt456",
    "amount": 25000,
    "phoneNumber": "250789000000"
  }'

# Réponse: { id: "pay789", momoReference: "PASS_..." }

# 4. Vérifier le statut (avec polling)
curl -X GET http://localhost:3000/payments/status/PASS_...

# Une fois le paiement SUCCESSFUL, le ticket est créé automatiquement

# 5. Récupérer les tickets
curl -X GET http://localhost:3000/tickets/user/abc123
```

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev           # Démarrer avec ts-node en watch mode

# Build
npm run build         # Compiler TypeScript en JavaScript

# Production
npm run start         # Démarrer l'application compilée

# Database
npm run prisma:generate   # Générer le client Prisma
npm run prisma:migrate    # Créer une migration
npm run prisma:push       # Appliquer le schéma à la DB
```

## 📊 Modèle de données

### User
- `id`: UUID (clé primaire)
- `name`: Nom complet
- `email`: Email unique
- `phone`: Numéro de téléphone
- `createdAt`: Date de création

### Event
- `id`: UUID
- `title`: Titre de l'événement
- `description`: Description
- `price`: Prix en centimes
- `date`: Date de l'événement
- `location`: Lieu
- `createdBy`: ID du créateur
- `createdAt`: Date de création

### Payment
- `id`: UUID
- `userId`: Référence à User
- `eventId`: Référence à Event
- `amount`: Montant en centimes
- `status`: PENDING | SUCCESSFUL | FAILED | EXPIRED
- `momoReference`: Référence MTN MoMo
- `externalId`: ID externe MTN MoMo

### Ticket
- `id`: UUID
- `userId`: Référence à User
- `eventId`: Référence à Event
- `paymentId`: Référence à Payment (unique)
- `qrCode`: Code QR en Base64
- `status`: ACTIVE | USED | EXPIRED

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 Licence

MIT

## 📧 Support

Pour toute question ou problème, contactez : support@passevent.com
