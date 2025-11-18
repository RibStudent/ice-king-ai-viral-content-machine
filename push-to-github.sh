#!/bin/bash

echo "========================================="
echo "GitHub Repository Setup Instructions"
echo "========================================="
echo ""
echo "1. Go to https://github.com/new"
echo "2. Create a new repository with these settings:"
echo "   - Repository name: ice-king-ai-viral-content-machine"
echo "   - Description: AI-powered viral content machine with music generation features"
echo "   - Set to Public or Private (your choice)"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
echo "3. After creating, GitHub will show you the repository URL."
echo "   It will look like: https://github.com/YOUR_USERNAME/ice-king-ai-viral-content-machine.git"
echo ""
read -p "Enter your GitHub repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "Error: Repository URL cannot be empty"
    exit 1
fi

echo ""
echo "Adding remote origin..."
git remote add origin "$REPO_URL"

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "========================================="
echo "✅ Repository successfully pushed to GitHub!"
echo "========================================="
echo "Your repository is now available at: $REPO_URL"
echo ""
echo "You can view it by removing the .git extension from the URL"