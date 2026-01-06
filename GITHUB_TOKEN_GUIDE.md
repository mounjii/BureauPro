# 🔐 Créer un Personal Access Token GitHub

## Pourquoi un token ?

GitHub n'accepte plus les mots de passe pour Git. Vous devez utiliser un **Personal Access Token**.

---

## 📝 Étapes pour créer un token

### 1. Allez sur GitHub

1. Connectez-vous sur **https://github.com**
2. Cliquez sur votre **avatar** (en haut à droite)
3. Cliquez sur **"Settings"**

### 2. Créer le token

1. Dans le menu de gauche, cliquez sur **"Developer settings"** (tout en bas)
2. Cliquez sur **"Personal access tokens"** → **"Tokens (classic)"**
3. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**

### 3. Configurer le token

1. **Note :** Donnez un nom (ex: "Burocycle App")
2. **Expiration :** Choisissez (ex: "90 days" ou "No expiration")
3. **Scopes :** Cochez au minimum :
   - ✅ **repo** (tout cocher dans repo)
4. Cliquez sur **"Generate token"** (en bas)

### 4. Copier le token

⚠️ **IMPORTANT :** Copiez le token immédiatement ! Il ne sera affiché qu'une seule fois.

Le token ressemble à : `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🚀 Utiliser le token

### Lors du push Git

Quand Git vous demande :
- **Username :** `mounjii`
- **Password :** Collez votre **token** (pas votre mot de passe GitHub !)

### Dans GitHub Desktop

GitHub Desktop utilise votre session GitHub, pas besoin de token.

---

## 🔄 Alternative : Utiliser GitHub Desktop

Si vous préférez éviter les tokens :

1. Téléchargez **GitHub Desktop** : https://desktop.github.com
2. Installez et connectez-vous
3. Utilisez l'interface graphique (plus simple !)

---

## 📖 Guide GitHub Desktop

Voir `GITHUB_DESKTOP_GUIDE.md` pour les instructions détaillées.

