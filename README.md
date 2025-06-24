# Conformité CNDP – Loi 09-08

Application web moderne pour aider les organisations marocaines à se conformer à la Loi 09-08 (protection des données personnelles, CNDP).

## Fonctionnalités principales
- **Outil d'auto-évaluation de maturité** (questionnaire, score, radar)
- **Tableau de bord de conformité** (niveau, recommandations, graphiques)
- **Guide Loi 09-08 pas à pas** (checklist, timeline, modèles)
- **Générateur de documents** (politique de confidentialité, registre, DPIA, export PDF/docx)
- **Section bonnes pratiques** (articles, points clés, actualités CNDP)
- **Authentification utilisateur** (optionnelle)

## Installation locale
1. **Prérequis** : Node.js >= 16 (portable ou installé)
2. **Installation** :
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Lancement** :
   - Démarrer le backend :
     ```bash
     cd server && npm start
     ```
   - Démarrer le frontend :
     ```bash
     cd ../client && npm start
     ```
4. Accédez à [http://localhost:3000](http://localhost:3000)

## Utilisation sur Replit
- Importez ce repo sur [replit.com](https://replit.com/)
- Lancez les deux serveurs (backend et frontend)

## Technologies
- Frontend : React, TailwindCSS
- Backend : Node.js, Express
- Stockage : Fichier JSON (ou SQLite/MongoDB)

## Localisation
- Interface et contenus en français, adaptés à la Loi 09-08 et la CNDP. 