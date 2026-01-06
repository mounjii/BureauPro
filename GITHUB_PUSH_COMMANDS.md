# 📤 Commandes pour pousser le code sur GitHub

## Si Git est installé, exécutez ces commandes dans Git Bash ou PowerShell :

```bash
# Aller dans le dossier du projet
cd C:\Users\a\Desktop\bureaupro---catalogue-professionnel

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le commit
git commit -m "Initial commit - Burocycle app with Cloudinary and deployment config"

# Ajouter le remote GitHub
git remote add origin https://github.com/mounjii/BUROCYCLE.git

# Renommer la branche en main
git branch -M main

# Pousser le code
git push -u origin main
```

---

## ⚠️ Si vous avez déjà un remote, utilisez :

```bash
git remote set-url origin https://github.com/mounjii/BUROCYCLE.git
git push -u origin main
```

---

## 🎯 Alternative : Utiliser GitHub Desktop

1. Téléchargez : https://desktop.github.com
2. Installez et connectez-vous
3. File → Add Local Repository
4. Sélectionnez votre dossier
5. Publish repository → Choisissez `mounjii/BUROCYCLE`

