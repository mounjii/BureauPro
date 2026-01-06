@echo off
echo ========================================
echo   Push Code to GitHub - BUROCYCLE
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Git n'est pas installe ou pas dans le PATH
    echo.
    echo Veuillez installer Git depuis: https://git-scm.com/download/win
    echo OU utilisez GitHub Desktop (plus simple)
    echo.
    pause
    exit /b 1
)

echo [OK] Git est installe
echo.

REM Initialize Git if needed
if not exist .git (
    echo Initialisation de Git...
    git init
    echo.
)

REM Add all files
echo Ajout de tous les fichiers...
git add .
echo.

REM Check if there are changes
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Aucun changement a commiter
) else (
    echo Creation du commit...
    git commit -m "Initial commit - Burocycle app with Cloudinary and deployment config"
    echo.
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Ajout du remote GitHub...
    git remote add origin https://github.com/mounjii/BUROCYCLE.git
    echo.
) else (
    echo Mise a jour du remote...
    git remote set-url origin https://github.com/mounjii/BUROCYCLE.git
    echo.
)

REM Set branch to main
echo Configuration de la branche main...
git branch -M main
echo.

REM Push to GitHub
echo.
echo ========================================
echo   PUSH VERS GITHUB
echo ========================================
echo.
echo Vous allez etre demande de vous connecter a GitHub
echo Utilisez votre nom d'utilisateur et un Personal Access Token
echo (Pas votre mot de passe - creez un token sur github.com/settings/tokens)
echo.
pause

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCES !
    echo ========================================
    echo.
    echo Votre code a ete pousse sur GitHub !
    echo Verifiez sur: https://github.com/mounjii/BUROCYCLE
    echo.
) else (
    echo.
    echo ========================================
    echo   ERREUR
    echo ========================================
    echo.
    echo Le push a echoue. Verifiez:
    echo 1. Vos identifiants GitHub
    echo 2. Que le repository existe sur GitHub
    echo 3. Utilisez un Personal Access Token au lieu du mot de passe
    echo.
)

pause

