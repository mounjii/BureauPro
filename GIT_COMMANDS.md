# 🚀 Commandes Git - À exécuter dans un NOUVEAU terminal

## ⚠️ IMPORTANT : Redémarrez votre terminal !

Après l'installation de Git, vous **DEVEZ** fermer et rouvrir votre terminal.

---

## 📋 Étapes à suivre

### 1. Fermez ce terminal complètement

### 2. Ouvrez un NOUVEAU terminal

- **Option A :** Ouvrez **Git Bash** (recommandé - installé avec Git)
  - Cherchez "Git Bash" dans le menu Démarrer
  
- **Option B :** Ouvrez un nouveau **PowerShell** ou **CMD**

### 3. Naviguez vers votre dossier

```bash
cd C:\Users\a\Desktop\bureaupro---catalogue-professionnel
```

### 4. Vérifiez que Git fonctionne

```bash
git --version
```

**Vous devriez voir :** `git version 2.x.x` (ou similaire)

Si vous voyez une erreur, Git n'est pas installé correctement.

---

## 🚀 Commandes à exécuter (dans l'ordre)

### Étape 1 : Initialiser Git

```bash
git init
```

### Étape 2 : Ajouter tous les fichiers

```bash
git add .
```

### Étape 3 : Créer le commit

```bash
git commit -m "Initial commit - Burocycle app with Cloudinary and deployment config"
```

### Étape 4 : Ajouter le remote GitHub

```bash
git remote add origin https://github.com/mounjii/BUROCYCLE.git
```

**Note :** Si vous avez déjà un remote, utilisez :
```bash
git remote set-url origin https://github.com/mounjii/BUROCYCLE.git
```

### Étape 5 : Renommer la branche en main

```bash
git branch -M main
```

### Étape 6 : Pousser vers GitHub

```bash
git push -u origin main
```

---

## 🔐 Authentification GitHub

Quand Git vous demande vos identifiants :

1. **Username :** `mounjii`

2. **Password :** Utilisez un **Personal Access Token** (PAS votre mot de passe GitHub)
   - Guide pour créer un token : `GITHUB_TOKEN_GUIDE.md`
   - Le token ressemble à : `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ✅ Vérification

Une fois terminé, vérifiez sur :
**https://github.com/mounjii/BUROCYCLE**

Vous devriez voir tous vos fichiers !

---

## 🐛 Problèmes courants

### "git: command not found"
- **Solution :** Fermez et rouvrez votre terminal
- Ou utilisez **Git Bash** au lieu de PowerShell

### "remote origin already exists"
- **Solution :** Utilisez `git remote set-url origin https://github.com/mounjii/BUROCYCLE.git`

### "Authentication failed"
- **Solution :** Utilisez un Personal Access Token au lieu du mot de passe
- Voir `GITHUB_TOKEN_GUIDE.md`

---

## 🎯 Alternative : GitHub Desktop

Si vous préférez une interface graphique :
1. Téléchargez GitHub Desktop : https://desktop.github.com
2. Installez et connectez-vous
3. File → Add Local Repository
4. Publish repository

Plus simple, pas besoin de ligne de commande !

