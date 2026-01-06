# 🔧 Résoudre le Problème de Connexion

## 🐛 Problème

Vous ne pouvez pas vous connecter sur https://burocycle-catalogue.netlify.app/

## 🔍 Causes possibles

### 1. Backend non déployé sur Render
Le frontend essaie de se connecter au backend, mais le backend n'existe pas encore.

### 2. Variable d'environnement manquante
`VITE_API_URL` n'est pas configurée sur Netlify.

### 3. Backend non accessible
Le backend Render n'est pas démarré ou n'est pas accessible.

---

## ✅ Solutions

### Solution 1 : Vérifier la variable d'environnement sur Netlify

1. Allez sur **Netlify** : https://app.netlify.com
2. Sélectionnez votre site : `burocycle-catalogue`
3. Allez dans **Site settings** → **Environment variables**
4. Vérifiez que vous avez :
   ```
   VITE_API_URL = https://votre-backend.onrender.com/api
   ```
   (Remplacez par l'URL réelle de votre backend Render)

5. Si elle n'existe pas, **ajoutez-la**
6. **Redeployez** le site :
   - Allez dans **Deploys**
   - Cliquez sur **"Trigger deploy"** → **"Clear cache and deploy site"**

---

### Solution 2 : Déployer le backend sur Render

Si vous n'avez pas encore déployé le backend :

1. **Créez une base de données PostgreSQL sur Render**
   - Voir `RENDER_SETUP.md` - Étape 1

2. **Créez un Web Service sur Render**
   - Voir `RENDER_SETUP.md` - Étape 2
   - Connectez votre repository GitHub `BUROCYCLE`
   - Configurez les variables d'environnement

3. **Notez l'URL du backend Render**
   - Exemple : `https://burocycle-backend.onrender.com`

4. **Mettez à jour Netlify**
   - Ajoutez/modifiez `VITE_API_URL` avec l'URL de votre backend
   - Format : `https://burocycle-backend.onrender.com/api`

5. **Redeployez Netlify**

---

### Solution 3 : Vérifier que le backend fonctionne

1. Testez l'URL du backend directement :
   ```
   https://votre-backend.onrender.com/api/health
   ```
   Devrait retourner : `{"status":"OK","message":"BureauPro API is running"}`

2. Si ça ne fonctionne pas :
   - Vérifiez les logs dans Render
   - Vérifiez que toutes les variables d'environnement sont définies
   - Vérifiez que la base de données est créée

---

## 🔍 Diagnostic

### Vérifier dans la console du navigateur

1. Ouvrez https://burocycle-catalogue.netlify.app/
2. Appuyez sur **F12** (ouvre les outils développeur)
3. Allez dans l'onglet **Console**
4. Essayez de vous connecter
5. Regardez les erreurs :
   - **"Failed to fetch"** = Backend non accessible
   - **"Network error"** = URL incorrecte ou CORS
   - **"404 Not Found"** = Route API incorrecte

### Vérifier dans l'onglet Network

1. Dans les outils développeur, allez dans **Network**
2. Essayez de vous connecter
3. Regardez les requêtes :
   - Quelle URL est appelée ?
   - Est-ce la bonne URL du backend ?
   - Y a-t-il des erreurs (rouge) ?

---

## 📋 Checklist

- [ ] Backend déployé sur Render
- [ ] Base de données PostgreSQL créée sur Render
- [ ] Variables d'environnement configurées sur Render
- [ ] `VITE_API_URL` configurée sur Netlify
- [ ] Backend accessible (test `/api/health`)
- [ ] Netlify redéployé après modification de `VITE_API_URL`

---

## 🚀 Étapes rapides

1. **Déployez le backend sur Render** (voir `RENDER_SETUP.md`)
2. **Copiez l'URL du backend** (ex: `https://burocycle-backend.onrender.com`)
3. **Sur Netlify**, ajoutez la variable :
   ```
   VITE_API_URL = https://burocycle-backend.onrender.com/api
   ```
4. **Redeployez Netlify**
5. **Testez la connexion**

---

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifiez les logs dans Render (onglet "Logs")
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que CORS est activé dans `server/index.js`
4. Vérifiez que le backend écoute sur le bon port (10000 pour Render)

---

## 📖 Guides disponibles

- `RENDER_SETUP.md` - Guide complet pour déployer sur Render
- `DEPLOYMENT_GUIDE.md` - Guide de déploiement complet

