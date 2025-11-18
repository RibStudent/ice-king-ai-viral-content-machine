#!/bin/bash

echo "========================================="
echo "Creating GitHub Repository"
echo "========================================="
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please run: ./install-gh-cli.sh first"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Create the repository
echo "Creating repository on GitHub..."
gh repo create ice-king-ai-viral-content-machine \
    --description "AI-powered viral content machine with music generation features" \
    --source=. \
    --remote=origin \
    --push \
    --public

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Success! Repository created and pushed!"
    echo "========================================="
    echo ""
    echo "Your repository is now available at:"
    gh repo view --web
else
    echo ""
    echo "❌ Failed to create repository."
    echo "The repository might already exist or there was an error."
    echo ""
    echo "You can try:"
    echo "1. Choose a different name"
    echo "2. Delete the existing repository on GitHub"
    echo "3. Use the manual method with ./push-to-github.sh"
fi