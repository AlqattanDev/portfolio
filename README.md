# Ali's Portfolio Website

A modern, terminal-inspired portfolio website built with Astro and deployed via GitHub Actions.

## Features

- **Git-based Content Management**: Update your CV and blog posts by editing files in this repository
- **Dual View System**: Toggle between digital terminal view and print-ready view
- **Interactive Particle Effects**: Dynamic background animations in digital view
- **Responsive Design**: Looks great on all devices
- **Blog System**: Write posts in Markdown and they're automatically published
- **Custom Domain**: Deployed to alialqattan.dev

## Quick Start

### Updating Your CV
Edit `src/data/profile.json` to update your personal information, projects, skills, and education.

### Adding Blog Posts
1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with title, description, publishDate, and tags
3. Write your post in Markdown
4. Commit and push - your post will be live automatically!

### Local Development
```bash
npm install
npm run dev
```

### Deployment
The site automatically deploys to GitHub Pages when you push to the main branch.

## Technology Stack

- **Astro** - Static site generator
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Hosting
- **Particles.js** - Interactive background effects
- **JetBrains Mono & Space Mono** - Typography

## Mobile Workflow

You can update this entire website from your phone using the GitHub mobile app:
1. Open the GitHub app
2. Navigate to this repository
3. Edit `src/data/profile.json` for CV updates
4. Add new `.md` files to `src/content/blog/` for blog posts
5. Commit changes - the site updates automatically!

