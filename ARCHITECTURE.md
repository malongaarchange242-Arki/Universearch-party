# PassEvent - Architecture et Design Patterns

## 🏗️ Vue d'ensemble de l'architecture

PassEvent suit une architecture **layered (en couches)** avec une séparation claire des responsabilités.

```
┌─────────────────────────────────┐
│    HTTP Requests (Fastify)      │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Controllers (HTTP Layer)      │  ← Gère requêtes/réponses
├─────────────────────────────────┤
│  • Parse les requêtes           │
│  • Format les réponses          │
│  • Gère les erreurs HTTP        │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Services (Business Logic)     │  ← Logique métier
├─────────────────────────────────┤
│  • Validations                  │
│  • Orchestration                │
│  • Logique complexe             │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Repositories (Data Access)      │  ← Accès base de données
├─────────────────────────────────┤
│  • Prisma queries               │
│  • CRUD operations              │
│  • Transformations              │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Database (PostgreSQL)          │
└─────────────────────────────────┘
```

## 📦 Modules

### 1. **Auth Module** (Authentification)

**Responsabilités:**
- Enregistrement des utilisateurs
- Gestion des profils
- Authentification (login)

**Fichiers:**
```
auth/
├── auth.model.ts      # Types d'interfaces
├── auth.repository.ts # Accès base de données
├── auth.service.ts    # Logique métier
└── auth.controller.ts # Endpoints HTTP
```

**Flux d'une requête:**
```
POST /auth/register
  ↓
AuthController.register()
  ↓ parseBody
  ├→ Valide input
  ├→ AuthService.registerUser()
  │   ├→ Valide email/phone
  │   ├→ Vérifie unicité email
  │   ├→ AuthRepository.createUser()
  │   │  └→ Prisma insert user
  │   └→ Retourne user
  └→ Retourne réponse HTTP
```

### 2. **Events Module** (Événements)

**Responsabilités:**
- Création/édition d'événements
- Listing des événements
- Filtrage par créateur

**Modèle:**
```prisma
model Event {
  id: String @id @default(uuid())
  title: String
  description: String?
  price: Int      # En centimes
  date: DateTime
  location: String
  createdBy: String
}
```

### 3. **Payments Module** (Paiements)

**Responsabilités:**
- Initier les paiements via MTN MoMo
- Tracker les statuts de paiement
- Créer automatiquement des tickets

**Flux de paiement:**
```
Client POST /payments
  ↓
PaymentsController.requestPayment()
  ↓
PaymentsService.requestPayment()
  ├→ Valide user/event
  ├→ Crée record Payment avec status=PENDING
  ├→ MoMoPayment.requestToPay() [APPEL API]
  └→ Retourne payment avec referenceId

Client (polling) GET /payments/status/:reference
  ↓
PaymentsService.checkPaymentStatus()
  ├→ MoMoStatus.getPaymentStatus() [APPEL API]
  ├→ Met à jour status dans DB
  ├→ Si SUCCESSFUL → TicketsService.createTicket()
  └→ Retourne payment avec nouveau status
```

### 4. **Tickets Module** (Tickets)

**Responsabilités:**
- Création automatique après paiement
- Génération des QR codes
- Validation des tickets à l'entrée

**QR Code:**
```json
{
  "ticketId": "payment_id",
  "userId": "user_id",
  "eventId": "event_id",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 5. **MoMo Integration** (MTN MoMo)

**Architecture:**
```
MoMoClient (Base)
  ├→ MoMoToken (Gestion tokens)
  ├→ MoMoPayment (RequestToPay)
  └→ MoMoStatus (Get status)
```

**Authentification MTN MoMo:**
```
Headers required:
- Authorization: Bearer {ACCESS_TOKEN}
- X-Reference-Id: {UNIQUE_ID}
- Ocp-Apim-Subscription-Key: {SUBSCRIPTION_KEY}
```

## 🎯 Patterns utilisés

### 1. **Repository Pattern**

**Objectif:** Abstraire l'accès à la base de données

```typescript
// Repository = Couche d'accès DB
class EventsRepository {
  async create(data): Promise<Event> {
    return await prisma.event.create({ data });
  }
}

// Service = Aucune dépendance à Prisma
class EventsService {
  constructor() {
    this.repository = new EventsRepository();
  }
  
  async createEvent(data) {
    // Logique métier
    return await this.repository.create(data);
  }
}
```

**Avantages:**
- Facile à tester (mock repository)
- Peut changer la DB sans affecter service
- Centralize les requêtes DB

### 2. **Service Layer Pattern**

**Objectif:** Séparer la logique métier des contrôleurs

```typescript
// Controller = HTTP uniquement
class EventsController {
  async create(request, reply) {
    const result = await this.service.createEvent(request.body);
    return reply.send(result);
  }
}

// Service = Logique métier
class EventsService {
  async createEvent(data) {
    // Validations
    if (!data.title) throw new Error("Title required");
    
    // Logique complexe
    data.price = convertToMainCurrency(data.price);
    
    // Appels database
    return await this.repository.create(data);
  }
}
```

**Avantages:**
- Logique métier reusable
- Facile à tester indépendamment
- Contrôleurs simples et lisibles

### 3. **Dependency Injection (Simple)**

```typescript
class EventsService {
  private repository: EventsRepository;

  constructor() {
    // Injection de dépendance via constructeur
    this.repository = new EventsRepository();
  }

  async getEventById(id: string) {
    return await this.repository.findById(id);
  }
}
```

### 4. **DTO (Data Transfer Object)**

```typescript
// Model = Types de données
interface CreateEventDto {
  title: string;
  description?: string;
  price: number;
  date: string;
  location: string;
  createdBy: string;
}

// Response = Données retournées
interface EventResponse {
  id: string;
  title: string;
  // ...
}
```

## 🔄 Flux d'une requête complète

### Exemple: Créer un événement

```
1. Client envoie
   POST /events
   {
     "title": "Concert",
     "price": 5000,
     "date": "2024-04-20T19:00:00Z",
     "location": "Kigali",
     "createdBy": "user123"
   }

2. Fastify reçoit la requête
   → Route match /events (POST)
   → Appèle EventsController.create()

3. Controller
   → Parse le body
   → Appèle EventsService.createEvent()

4. Service
   → Valide les données
   → Appèle EventsRepository.create()

5. Repository
   → Prisma.event.create()
   → Retourne Event creéé

6. Service
   → Retourne EventResponse

7. Controller
   → Reçoit le résultat
   → Format en JSON
   → Retourne avec status 201

8. Fastify
   → Envoie la réponse HTTP
   {
     "success": true,
     "message": "Event created successfully",
     "data": { id: "evt123", ... }
   }

9. Client reçoit
   → Parse la réponse
   → Affiche dans l'UI
```

## 🛡️ Gestion des erreurs

**Stratégie:**

```typescript
try {
  // Service
  const event = await this.repository.create(data);
  return event;
} catch (error) {
  // Service lance une erreur
  throw new Error("Failed to create event");
}

// Dans le Controller
try {
  const event = await service.createEvent(data);
  return reply.send(successResponse("Event created", event));
} catch (error) {
  // Controller capture l'erreur
  const message = error.message || "Unknown error";
  return reply.status(400).send(errorResponse(message));
}
```

## 📊 Validation des données

```typescript
// 1. Input Validation (dans Service)
async createEvent(data: CreateEventDto) {
  if (!data.title) throw new Error("Title required");
  if (data.price < 0) throw new Error("Price must be positive");
  if (new Date(data.date) < new Date()) {
    throw new Error("Date cannot be in the past");
  }
}

// 2. Business Logic Validation
async createPayment(data: CreatePaymentDto) {
  // Vérifier que l'user existe
  const user = await userRepo.findById(data.userId);
  if (!user) throw new Error("User not found");
  
  // Vérifier que l'event existe
  const event = await eventRepo.findById(data.eventId);
  if (!event) throw new Error("Event not found");
}

// 3. Type Validation (TypeScript)
interface CreateEventDto {
  title: string;        // ✓ Required
  description?: string; // ? Optional
  price: number;        // ✓ Type-safe
}
```

## 🔧 Tests (future implémentation)

```typescript
// Exemple de test avec Jest
describe("EventsService", () => {
  let service: EventsService;
  let mockRepository: jest.Mocked<EventsRepository>;

  beforeEach(() => {
    mockRepository = jest.mock(EventsRepository);
    service = new EventsService();
  });

  test("createEvent should validate title", async () => {
    await expect(
      service.createEvent({ ...invalidData, title: "" })
    ).rejects.toThrow("Title required");
  });

  test("createEvent should call repository", async () => {
    await service.createEvent(validData);
    expect(mockRepository.create).toHaveBeenCalledWith(validData);
  });
});
```

## 📈 Scalabilité

### Pour supporter 100k+ utilisateurs:

1. **Caching**
   ```typescript
   // Exemple avec Redis
   async getEvent(id: string) {
     let event = await redis.get(`event:${id}`);
     if (!event) {
       event = await db.getEvent(id);
       await redis.set(`event:${id}`, event, 3600);
     }
     return event;
   }
   ```

2. **Database Indexing**
   ```prisma
   model Event {
     @@index([createdBy])
     @@index([date])
   }
   ```

3. **Queue System** (pour paiements)
   ```typescript
   // Utiliser Bull/RabbitMQ pour les paiements async
   // Au lieu de traiter directement
   ```

4. **Microservices** (future)
   ```
   PassEvent API
   ├── User Service
   ├── Event Service
   ├── Payment Service
   ├── Ticket Service
   └── Notification Service
   ```

## 📚 Conventions de code

1. **Nommage des fichiers**: `kebab-case` (ex: `auth.controller.ts`)
2. **Nommage des classes**: `PascalCase` (ex: `AuthController`)
3. **Nommage des fonctions**: `camelCase` (ex: `createUser()`)
4. **Types/Interfaces**: `PascalCase` avec suffix (ex: `UserDto`, `UserResponse`)
5. **Constants**: `UPPER_SNAKE_CASE` (ex: `MAX_RETRIES`)

## 🎓 Conclusions

Cette architecture offre :
- ✅ Séparation des responsabilités
- ✅ Testabilité élevée
- ✅ Maintenance facile
- ✅ Scalabilité
- ✅ Code réutilisable
- ✅ Erreurs clairement gérées
