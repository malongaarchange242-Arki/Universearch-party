# PassEvent API - Guide d'installation et de configuration

## 🔧 Installation initiale

### Prérequis

- Node.js 18.x ou plus
- npm 9.x ou plus
- PostgreSQL 13+ (local ou Supabase)

### Étapes d'installation

1. **Clone ou crée le dossier du projet**
   ```bash
   cd pass-event
   ```

2. **Installe les dépendances**
   ```bash
   npm install
   ```

3. **Configure la base de données**
   - Crée une base de données PostgreSQL
   - Ou utilise Supabase (recommandé) : https://supabase.com

4. **Configure les variables d'environnement**
   ```bash
   # Copier et éditer le fichier .env
   cp .env .env.local
   
   # Editer le fichier .env.local avec tes vraies valeurs
   ```

   Exemple `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pass_event"
   PORT=3000
   NODE_ENV=development
   
   MOMO_API_USER=your_momo_user
   MOMO_API_KEY=your_momo_key
   MOMO_SUBSCRIPTION_KEY=your_momo_subscription_key
   MOMO_ENVIRONMENT=sandbox
   MOMO_CALLBACK_URL=http://localhost:3000/payments/callback
   ```

5. **Initialise Prisma et la base de données**
   ```bash
   # Genère le client Prisma
   npm run prisma:generate
   
   # Crée les tables dans la base de données
   npm run prisma:push
   ```

6. **Lance le serveur de développement**
   ```bash
   npm run dev
   ```

   Tu devrais voir :
   ```
   ⚡ PassEvent API Server running at: http://0.0.0.0:3000
   ```

7. **Teste l'API**
   ```bash
   # Health check
   curl http://localhost:3000/health
   ```

## 🌐 Configuration Supabase

### Créer une base de données Supabase

1. Va sur https://supabase.com
2. Clique sur "New Project"
3. Remplis les infos :
   - Name: pass-event
   - Region: Proche de tes utilisateurs
   - Password: Génère un mot de passe fort
4. Clique "Create new project" et attends ~2 minutes

### Récupérer la connexion

1. Va dans Settings → Database
2. Copie la connection string PostgreSQL
3. Colles-la dans `DATABASE_URL` du `.env`

Exemple :
```
postgresql://postgres:[PASSWORD]@db.tzrsqiuhb.supabase.co:5432/postgres
```

## 💳 Configuration MTN MoMo

### Sandbox (Tests)

1. Va sur https://momodeveloper.mtn.com
2. Crée un compte développeur
3. Crée une collection API
4. Copie tes credentials:
   - API User
   - API Key
   - Subscription Key

Ajoute-les à `.env`:
```env
MOMO_API_USER=your_user_123456
MOMO_API_KEY=your_key_987654
MOMO_SUBSCRIPTION_KEY=your_subscription_key
MOMO_ENVIRONMENT=sandbox
```

### Production

Quand tu es prêt pour la production :

1. Demande l'accès production auprès de MTN
2. Change `MOMO_ENVIRONMENT=production`
3. Utilise les identifiants de production

## 🚀 Déploiement

### Option 1: Heroku

```bash
# Crée une app Heroku
heroku create pass-event

# Ajoute la base de données PostgreSQL
heroku addons:create heroku-postgresql:standard-0 -a pass-event

# Configure les variables d'environnement
heroku config:set DATABASE_URL=... -a pass-event
heroku config:set MOMO_API_USER=... -a pass-event
heroku config:set MOMO_API_KEY=... -a pass-event
heroku config:set MOMO_SUBSCRIPTION_KEY=... -a pass-event
heroku config:set NODE_ENV=production -a pass-event

# Deploy
git push heroku main

# Voir les logs
heroku logs --tail -a pass-event
```

### Option 2: Railway.app

```bash
# Crée un projet Railway
# Connecte ton repo GitHub
# Railway detecte automatiquement Node.js

# Configure les variables :
# Settings → Variables
# DATABASE_URL=...
# MOMO_API_USER=...
# etc.
```

### Option 3: Docker (n'importe quel serveur)

```dockerfile
# Crée un Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build et run
docker build -t pass-event .
docker run -e DATABASE_URL=... -p 3000:3000 pass-event
```

## 🧪 Test de l'API

### Enregistrer un utilisateur

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+250789123456"
  }'
```

Répond avec `userId`

### Créer un événement

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon Événement",
    "description": "Description de mon événement",
    "price": 10000,
    "date": "2024-12-25T19:00:00Z",
    "location": "Kigali",
    "createdBy": "USER_ID"
  }'
```

### Initier un paiement

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "eventId": "EVENT_ID",
    "amount": 10000,
    "phoneNumber": "250789123456"
  }'
```

## ⚠️ Troubleshooting

### Erreur: "Database connection failed"

```
✅ Solution:
- Vérifie DATABASE_URL dans .env
- Assure-toi que PostgreSQL tourne
- Test la connexion: psql $DATABASE_URL
```

### Erreur: "Prisma not found"

```bash
npm run prisma:generate
```

### Erreur: "Cannot find module 'dotenv'"

```bash
npm install
```

## 📚 Ressources

- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MTN MoMo API Docs](https://momodeveloper.mtn.com/docs)
- [Supabase Guide](https://supabase.com/docs)

## 🆘 Support

Si tu as des problèmes :

1. Vérifie les logs : `npm run dev`
2. Consulte le README.md
3. Vérifie la documentation Prisma/Fastify
4. Ouvre une issue sur GitHub

Bon courage ! 🚀
