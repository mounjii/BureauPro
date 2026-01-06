# 🚀 Guide Rapide de Déploiement

## ⚡ Déploiement en 5 étapes

### 1️⃣ Cloudinary (5 minutes)

1. Créez un compte sur [cloudinary.com](https://cloudinary.com)
2. Copiez vos clés depuis le Dashboard :
   - Cloud Name
   - API Key  
   - API Secret
3. Gardez-les pour l'étape 5

### 2️⃣ GitHub (2 minutes)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/burocycle-app.git
git push -u origin main
```

### 3️⃣ Netlify Frontend (5 minutes)

1. Allez sur [netlify.com](https://netlify.com)
2. **New site** → **Import from Git** → **GitHub**
3. Sélectionnez votre repo
4. Configuration :
   - Build: `npm run build`
   - Publish: `dist`
5. Variables d'environnement :
   ```
   VITE_API_URL=https://votre-backend.onrender.com/api
   ```
   (Vous ajouterez cette URL après l'étape 4)

### 4️⃣ Render Backend (10 minutes)

1. Allez sur [render.com](https://render.com)
2. **New +** → **PostgreSQL** :
   - Name: `burocycle-db`
   - Plan: **Free**
3. **New +** → **Web Service** :
   - Connectez votre repo GitHub
   - Name: `burocycle-backend`
   - Build: `npm install`
   - Start: `node server/index.js`
4. Variables d'environnement :
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Internal Database URL from Render>
   CLOUDINARY_CLOUD_NAME=<votre_cloud_name>
   CLOUDINARY_API_KEY=<votre_api_key>
   CLOUDINARY_API_SECRET=<votre_api_secret>
   JWT_SECRET=<générez_une_chaîne_aléatoire>
   ```
5. Copiez l'URL du service (ex: `https://burocycle-backend.onrender.com`)
6. Retournez sur Netlify et mettez à jour `VITE_API_URL`

### 5️⃣ Initialiser la base de données

Dans Render → Votre Web Service → **Shell** :

```bash
npm run init-db
```

---

## ✅ C'est tout !

Votre app est en ligne ! 🎉

- Frontend : `https://votre-app.netlify.app`
- Backend : `https://votre-backend.onrender.com`

---

## 📖 Guide complet

Pour plus de détails, consultez [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

