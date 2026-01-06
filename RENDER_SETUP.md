# 🗄️ Configuration Render - Base de données et Backend

## 📍 Étape 1 : Créer la base de données PostgreSQL (5 minutes)

1. Allez sur **[render.com](https://render.com)** et connectez-vous
2. Cliquez sur **"New +"** en haut à droite
3. Sélectionnez **"PostgreSQL"**

### Configuration de la base de données :

- **Name :** `burocycle-db`
- **Database :** `burocycle`
- **User :** (laissez par défaut, généré automatiquement)
- **Region :** Choisissez le plus proche (ex: `Frankfurt`, `Oregon`)
- **PostgreSQL Version :** `16` (ou la plus récente)
- **Plan :** **Free** (pour commencer)

4. Cliquez sur **"Create Database"**
5. ⚠️ **IMPORTANT :** Notez l'**Internal Database URL** (vous en aurez besoin !)
   - Format : `postgresql://user:password@host:5432/database`
   - Vous la trouverez dans les **Connection Info** de votre base de données

---

## ⚙️ Étape 2 : Créer le Web Service (Backend) (10 minutes)

1. Dans Render, cliquez sur **"New +"** → **"Web Service"**

2. **Connectez votre repository GitHub :**
   - Cliquez sur **"Connect account"** si pas déjà connecté
   - Autorisez Render à accéder à GitHub
   - Sélectionnez le repository : **`mounjii/BUROCYCLE`**

3. **Configurez le service :**

   - **Name :** `burocycle-backend`
   - **Region :** Même région que la base de données
   - **Branch :** `main`
   - **Root Directory :** (laissez vide)
   - **Environment :** `Node`
   - **Build Command :** `npm install`
   - **Start Command :** `node server/index.js`

4. **Plan :** **Free** (pour commencer)

5. Cliquez sur **"Advanced"** pour ajouter les variables d'environnement

---

## 🔐 Étape 3 : Variables d'environnement

Dans la section **Environment Variables**, ajoutez :

### Variables requises :

```
NODE_ENV=production
PORT=10000
```

### Base de données :

```
DATABASE_URL=<Collez l'Internal Database URL de l'étape 1>
```

### Cloudinary (si vous avez déjà créé le compte) :

```
CLOUDINARY_CLOUD_NAME=<votre_cloud_name>
CLOUDINARY_API_KEY=<votre_api_key>
CLOUDINARY_API_SECRET=<votre_api_secret>
```

### JWT Secret (générez une chaîne aléatoire) :

```
JWT_SECRET=maSuperCleSecrete123456789!@#$%^&*()_+-=[]{}|;:,.<>?
```

**Exemple de JWT_SECRET :** Utilisez un générateur en ligne ou créez une chaîne longue et aléatoire.

---

## 🚀 Étape 4 : Créer le service

1. Cliquez sur **"Create Web Service"**
2. Render va :
   - Cloner votre code depuis GitHub
   - Installer les dépendances (`npm install`)
   - Démarrer le serveur
3. ⏱️ Attendez **5-10 minutes** pour le premier déploiement
4. ✅ Une fois terminé, vous verrez l'URL de votre backend :
   - Exemple : `https://burocycle-backend.onrender.com`

---

## 📝 Étape 5 : Mettre à jour Netlify

1. Retournez sur **Netlify**
2. Allez dans votre site → **Site settings** → **Environment variables**
3. Mettez à jour ou ajoutez :
   ```
   VITE_API_URL=https://burocycle-backend.onrender.com/api
   ```
   (Remplacez par l'URL réelle de votre backend Render)
4. Cliquez sur **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 🗃️ Étape 6 : Initialiser la base de données

1. Dans Render, allez dans votre **Web Service** (`burocycle-backend`)
2. Cliquez sur l'onglet **"Shell"** (en haut)
3. Exécutez :
   ```bash
   npm run init-db:postgres
   ```
4. Attendez que ça se termine
5. Vous devriez voir : `✅ Database initialization completed successfully!`

---

## ✅ Vérification

1. Testez l'API : Visitez `https://votre-backend.onrender.com/api/health`
   - Devrait retourner : `{"status":"OK","message":"BureauPro API is running"}`

2. Testez le frontend : Visitez votre URL Netlify
   - Connectez-vous avec : `admin@bureaupro.com` / `admin123`

3. Testez l'upload d'image :
   - Allez dans le Dashboard
   - Ajoutez un produit avec une image
   - Vérifiez que l'image apparaît (elle devrait être sur Cloudinary)

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez les **logs** dans Render (onglet "Logs")
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que `DATABASE_URL` est correct

### Erreur de connexion à la base de données
- Vérifiez que vous utilisez l'**Internal Database URL** (pas l'External)
- Vérifiez que la base de données est bien créée

### Build échoue
- Vérifiez les logs dans Render
- Vérifiez que `package.json` contient toutes les dépendances

---

## 🎉 C'est terminé !

Votre backend est maintenant en ligne et connecté à la base de données PostgreSQL !

