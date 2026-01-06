# 🚀 Guide de Déploiement - Burocycle

Ce guide vous explique comment déployer votre application Burocycle sur Netlify (frontend), Render (backend), et Cloudinary (images).

---

## 📋 Prérequis

1. **Comptes gratuits nécessaires :**
   - ✅ GitHub (gratuit)
   - ✅ Netlify (gratuit)
   - ✅ Render (gratuit avec limitations)
   - ✅ Cloudinary (gratuit jusqu'à 25GB)

2. **Outils installés :**
   - Git
   - Node.js et npm

---

## 🌟 ÉTAPE 1 : Configuration Cloudinary

### 1.1 Créer un compte Cloudinary

1. Allez sur [cloudinary.com](https://cloudinary.com)
2. Cliquez sur **"Sign Up"** (gratuit)
3. Créez votre compte

### 1.2 Récupérer les clés API

1. Une fois connecté, allez dans le **Dashboard**
2. Vous verrez :
   - **Cloud Name** (ex: `dxyz123abc`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (ex: `abcdefghijklmnopqrstuvwxyz`)

3. **Notez ces 3 valeurs** - vous en aurez besoin plus tard

---

## 📦 ÉTAPE 2 : Préparer le code

### 2.1 Créer un fichier `.env` local

Créez un fichier `.env` à la racine du projet avec :

```env
PORT=3001
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Database (local pour test)
DATABASE_URL=sqlite:./server/database.sqlite

# Frontend API URL (local)
VITE_API_URL=http://localhost:3001/api

# JWT Secret
JWT_SECRET=votre_secret_jwt_aleatoire

# Gemini (optionnel)
GEMINI_API_KEY=votre_gemini_key
```

### 2.2 Tester Cloudinary en local

```bash
npm run server
```

Testez l'upload d'une image depuis le dashboard. Si ça fonctionne, vous êtes prêt !

---

## 🐙 ÉTAPE 3 : GitHub

### 3.1 Créer un repository GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New repository"**
3. Nommez-le : `burocycle-app`
4. Choisissez **Public** ou **Private**
5. **Ne cochez PAS** "Initialize with README"
6. Cliquez sur **"Create repository"**

### 3.2 Pousser le code sur GitHub

Dans votre terminal, à la racine du projet :

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Burocycle app"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/burocycle-app.git

# Pousser le code
git branch -M main
git push -u origin main
```

**Note :** Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub.

---

## 🎨 ÉTAPE 4 : Netlify (Frontend)

### 4.1 Créer un compte Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez sur **"Sign up"**
3. Choisissez **"Sign up with GitHub"**

### 4.2 Déployer depuis GitHub

1. Dans Netlify, cliquez sur **"Add new site"** → **"Import an existing project"**
2. Choisissez **"Deploy with GitHub"**
3. Autorisez Netlify à accéder à GitHub
4. Sélectionnez votre repository `burocycle-app`

### 4.3 Configuration du build

Dans les paramètres de déploiement :

- **Build command :** `npm run build`
- **Publish directory :** `dist`
- **Base directory :** (laissez vide)

### 4.4 Variables d'environnement

1. Allez dans **Site settings** → **Environment variables**
2. Ajoutez :

```
VITE_API_URL=https://votre-backend.onrender.com/api
```

**Note :** Vous obtiendrez l'URL du backend après avoir déployé sur Render (étape suivante).

### 4.5 Déployer

1. Cliquez sur **"Deploy site"**
2. Attendez 2-3 minutes
3. Votre site sera disponible sur `https://votre-app-123.netlify.app`

---

## ⚙️ ÉTAPE 5 : Render (Backend)

### 5.1 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Choisissez **"Sign up with GitHub"**

### 5.2 Créer une base de données PostgreSQL

1. Dans Render, cliquez sur **"New +"** → **"PostgreSQL"**
2. Configurez :
   - **Name :** `burocycle-db`
   - **Database :** `burocycle`
   - **User :** (généré automatiquement)
   - **Region :** Choisissez le plus proche
   - **Plan :** **Free** (pour commencer)
3. Cliquez sur **"Create Database"**
4. **Notez l'URL de connexion** (Internal Database URL)

### 5.3 Créer un Web Service (Backend)

1. Dans Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub `burocycle-app`
3. Configurez :

   - **Name :** `burocycle-backend`
   - **Region :** Même région que la DB
   - **Branch :** `main`
   - **Root Directory :** (laissez vide)
   - **Environment :** `Node`
   - **Build Command :** `npm install`
   - **Start Command :** `node server/index.js`

### 5.4 Variables d'environnement

Dans **Environment**, ajoutez :

```
NODE_ENV=production
PORT=10000

# Database (utilisez l'Internal Database URL de Render)
DATABASE_URL=postgresql://user:password@host:5432/database

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# JWT Secret (générez une chaîne aléatoire)
JWT_SECRET=votre_secret_jwt_super_long_et_aleatoire

# Gemini (optionnel)
GEMINI_API_KEY=votre_gemini_key
```

### 5.5 Créer le service

1. Cliquez sur **"Create Web Service"**
2. Render va :
   - Cloner votre code
   - Installer les dépendances
   - Démarrer le serveur
3. Attendez 5-10 minutes pour le premier déploiement

### 5.6 URL du backend

Une fois déployé, vous obtiendrez une URL comme :
```
https://burocycle-backend.onrender.com
```

**Copiez cette URL !**

### 5.7 Mettre à jour Netlify

Retournez sur Netlify et mettez à jour la variable d'environnement :

```
VITE_API_URL=https://burocycle-backend.onrender.com/api
```

Redeployez le site.

---

## 🔄 ÉTAPE 6 : Initialiser la base de données

### 6.1 Se connecter à la base de données

Vous pouvez utiliser :
- **pgAdmin** (outil graphique)
- **psql** (ligne de commande)
- **Render Shell** (dans Render)

### 6.2 Exécuter les migrations

Dans Render, allez dans votre Web Service → **Shell** :

```bash
# Initialiser la base de données
npm run init-db

# Exécuter les migrations
npm run migrate:available
npm run migrate:users
npm run migrate:permissions
```

**OU** créez un script de migration automatique (voir ci-dessous).

---

## ✅ ÉTAPE 7 : Tester

1. **Frontend :** Visitez votre URL Netlify
2. **Backend :** Visitez `https://votre-backend.onrender.com/api/health`
3. **Testez :**
   - Connexion
   - Ajout d'un produit avec image
   - Vérifiez que l'image est sur Cloudinary

---

## 🔧 Configuration finale

### URLs importantes

- **Frontend :** `https://votre-app.netlify.app`
- **Backend :** `https://votre-backend.onrender.com`
- **API :** `https://votre-backend.onrender.com/api`

### Variables d'environnement résumées

**Netlify (Frontend) :**
```
VITE_API_URL=https://votre-backend.onrender.com/api
```

**Render (Backend) :**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=...
```

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez les logs dans Render
- Vérifiez que toutes les variables d'environnement sont définies

### Les images ne s'affichent pas
- Vérifiez les clés Cloudinary
- Vérifiez que les images sont bien uploadées sur Cloudinary

### Erreur CORS
- Vérifiez que `cors()` est activé dans `server/index.js`
- Vérifiez l'URL dans `VITE_API_URL`

### La base de données est vide
- Exécutez `npm run init-db` dans Render Shell
- Vérifiez la connexion à la base de données

---

## 📝 Notes importantes

1. **Render Free Tier :**
   - Le service se met en veille après 15 minutes d'inactivité
   - Le premier démarrage peut prendre 30-60 secondes
   - Limite de 750 heures/mois

2. **Netlify Free Tier :**
   - 100 GB de bande passante/mois
   - Builds illimités
   - HTTPS automatique

3. **Cloudinary Free Tier :**
   - 25 GB de stockage
   - 25 GB de bande passante/mois
   - Transformations illimitées

---

## 🎉 Félicitations !

Votre application est maintenant en ligne ! Vous pouvez :
- ✅ Ajouter des produits depuis le dashboard
- ✅ Les images sont stockées sur Cloudinary
- ✅ Tout fonctionne en temps réel
- ✅ Pas besoin de redémarrer le serveur

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs dans Render
2. Les logs dans Netlify
3. La console du navigateur
4. Les variables d'environnement

Bon déploiement ! 🚀

