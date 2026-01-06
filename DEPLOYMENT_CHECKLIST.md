# ✅ Checklist de Déploiement

## Avant de commencer

- [ ] Compte GitHub créé
- [ ] Compte Netlify créé
- [ ] Compte Render créé
- [ ] Compte Cloudinary créé

---

## 📝 Étape par étape

### 1. Cloudinary
- [ ] Créer un compte sur cloudinary.com
- [ ] Noter le **Cloud Name**
- [ ] Noter l'**API Key**
- [ ] Noter l'**API Secret**

### 2. GitHub
- [ ] Créer un nouveau repository
- [ ] Pousser le code :
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/VOTRE_USERNAME/burocycle-app.git
  git push -u origin main
  ```

### 3. Render - Base de données
- [ ] Créer une base PostgreSQL
- [ ] Noter l'**Internal Database URL**
- [ ] Plan : **Free**

### 4. Render - Backend
- [ ] Créer un Web Service
- [ ] Connecter le repository GitHub
- [ ] Configuration :
  - Build: `npm install`
  - Start: `node server/index.js`
- [ ] Ajouter les variables d'environnement :
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL=<Internal Database URL>`
  - [ ] `CLOUDINARY_CLOUD_NAME=<votre_cloud_name>`
  - [ ] `CLOUDINARY_API_KEY=<votre_api_key>`
  - [ ] `CLOUDINARY_API_SECRET=<votre_api_secret>`
  - [ ] `JWT_SECRET=<chaîne_aléatoire>`
- [ ] Noter l'URL du backend (ex: `https://burocycle-backend.onrender.com`)

### 5. Netlify - Frontend
- [ ] Créer un nouveau site
- [ ] Connecter le repository GitHub
- [ ] Configuration :
  - Build: `npm run build`
  - Publish: `dist`
- [ ] Ajouter la variable d'environnement :
  - [ ] `VITE_API_URL=https://votre-backend.onrender.com/api`
- [ ] Noter l'URL du frontend (ex: `https://burocycle-app.netlify.app`)

### 6. Initialiser la base de données
- [ ] Aller dans Render → Votre Web Service → **Shell**
- [ ] Exécuter : `npm run init-db:postgres`
- [ ] Vérifier que les tables sont créées

### 7. Test final
- [ ] Visiter l'URL Netlify
- [ ] Se connecter avec :
  - Email: `admin@bureaupro.com`
  - Password: `admin123`
- [ ] Tester l'ajout d'un produit avec image
- [ ] Vérifier que l'image est sur Cloudinary

---

## 🎉 C'est terminé !

Votre application est maintenant en ligne et fonctionnelle !

---

## 📞 En cas de problème

1. Vérifiez les logs dans Render
2. Vérifiez les logs dans Netlify
3. Vérifiez la console du navigateur
4. Vérifiez que toutes les variables d'environnement sont correctes

