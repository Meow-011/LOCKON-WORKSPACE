<p align="center">
  <img src="source/images/lockon-logo.svg" alt="LOCKON Workspace Logo" width="150" />
</p>

<h1 align="center">LOCKON Workspace</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Mattermost-Team%20Edition-0058CC?style=for-the-badge&logo=mattermost" alt="Mattermost" />
  <img src="https://img.shields.io/badge/Docker-Deployed-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/React-Core%20Integration-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Theme-Cream%20Workspace-C1A173?style=for-the-badge" alt="Theme Cream" />
</p>

A production-grade team collaboration platform built on [Mattermost](https://mattermost.com/) Team Edition, heavily customized as **LOCKON Workspace**. It features a modern Cream Workspace theme, custom login experience, integrated Channel Tabs (Pins, Files, Links, Notes), Home Dashboard, LOCKON AI Panel, and is deployed via Docker Compose with a Custom Source Code Build Pipeline.

## Key Features & Customizations

LOCKON Workspace goes beyond standard Mattermost by introducing significant UI/UX improvements:

- **Custom Login Page**: A branded login experience featuring dynamic SVG background images (randomly selected on each visit), solid white login card with smooth fade-in animation, input field icons, and LOCKON branding with workspace badge in the header.
- **Channel Tabs (Core Integration)**: A Right-Hand Side (RHS) panel system built directly into the Mattermost webapp source code. Accessible via the App Bar, it seamlessly integrates:
  - **Pins**: A quick-access view for pinned messages.
  - **Files**: Aggregates all files and documents shared in the channel.
  - **Links**: Automatically extracts and displays all URLs shared in the channel.
  - **Notes**: Collaborative markdown text area per channel.
- **Home Dashboard (Core Integration)**: A full-featured home view built directly into the Mattermost webapp source. Provides at-a-glance widgets including:
  - **Unreads**: Channels with unread messages.
  - **Threads**: Active discussion threads.
  - **Drafts**: Unsent message drafts.
  - **Recent Channels**: Quickly jump to recently visited channels.
  - **Saved Posts**: Bookmarked messages for quick access.
  - **Quick Actions**: Shortcuts for common tasks.
- **LOCKON AI Panel (Core Integration)**: An AI assistant panel integrated into the App Bar, providing conversational AI capabilities within the workspace.
- **LOCKON Home Sidebar (`lockon-home-tab` plugin)**: A native left-sidebar "Home" link integration providing quick navigation to the Home Dashboard.
- **Custom Cream Theme**: A meticulously designed warm cream aesthetic (`#F3F2EF` backgrounds, `#C1A173` accents) applied natively to the build.
- **Global Branding & UI Overrides**: Mattermost branding is fully replaced with LOCKON via Core SCSS (`_lockon-branding.scss`). Telemetry, feedback buttons, and default hover states are cleanly overridden.

## Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core Platform** | Mattermost Team Edition | The base open-source collaboration server (Go/React). |
| **Custom Login Page** | React, TypeScript, SCSS | Dynamic SVG backgrounds, branded login card with animations. |
| **Channel Tabs UI** | React, TypeScript, SCSS | Integrated directly into Core source (`components/channel_tabs/`). |
| **Channel Tabs Backend** | Go (Plugin Server) | Headless API server for Links/Notes data (KV Store). |
| **Home Dashboard** | React, TypeScript, SCSS | Core-integrated widgets (`components/home_dashboard/`). |
| **LOCKON AI Panel** | React, TypeScript, SCSS | AI assistant panel (`components/lockon_ai/`). |
| **Home Sidebar Plugin** | Go, React (Plugin) | Left-sidebar Home link (`lockon-home-tab` plugin). |
| **Database** | PostgreSQL | Primary relational database for all workspace data. |
| **Reverse Proxy** | Nginx | Handles SSL termination and routes web traffic. |
| **Deployment** | Docker & Docker Compose | Containerized architecture for easy scaling and portability. |
| **Monitoring** | Prometheus & Grafana | System metrics and performance monitoring overlays. |

## System Architecture

LOCKON Workspace uses a **Custom Source Code Build System**:

```
source/
├── mattermost/                         # Cloned Mattermost source code
│   └── webapp/channels/src/
│       ├── components/
│       │   ├── channel_tabs/           # ★ Channel Tabs UI (Core Integration)
│       │   ├── home_dashboard/         # ★ Home Dashboard Widgets (Core Integration)
│       │   ├── lockon_ai/              # ★ LOCKON AI Panel (Core Integration)
│       │   ├── login/login.scss        # ★ Custom Login Page Styles
│       │   └── header_footer_route/    # ★ Login Header/Footer with LOCKON branding
│       ├── images/
│       │   ├── channel-tabs-icon.svg   # ★ App Bar icon for Channel Tabs
│       │   └── lockon-ai-icon.svg      # ★ App Bar icon for LOCKON AI
│       ├── plugins/lockon_init.ts      # ★ App startup registration
│       ├── sass/routes/_lockon-branding.scss  # ★ Global branding CSS overrides
│       └── root.html                   # ★ Custom title & favicon
├── lockon-channel-tabs/                # Plugin: Headless API Server (Go only)
├── lockon-home-tab/                    # Plugin: Home Sidebar Link (Go + React)
├── images/
│   ├── lockon-logo.svg                 # LOCKON logo
│   ├── logo.svg                        # Favicon/brand mark
│   └── loginbg/                        # ★ Login background SVG images (8 scenes)
└── Dockerfile                          # Multi-stage build instructions
```

- **Channel Tabs**: UI lives in Core source, backend API lives in the Plugin Go server.
- **Home Dashboard**: Full widget suite built directly into Core source.
- **Login Page**: Custom branded login with dynamic SVG backgrounds bundled via Webpack.
- The compiled Docker image is named `lockon-workspace:latest`.

## Quick Start (Development)

```bash
# 1. Clone the repository and navigate into it
git clone https://github.com/Meow-011/LOCKON-WORKSPACE.git
cd LOCKON-WORKSPACE

# 2. Copy environment template and generate secrets
cp env.example .env
# Edit .env — generate strong passwords (see instructions inside the file)

# 3. Create data directories
mkdir -p ./volumes/app/mattermost/{config,data,logs,plugins,client/plugins,bleve-indexes}

# 4. Build and start the custom LOCKON Workspace stack
# This builds the webapp from source (including all Core integrations) and creates the Docker image
docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d --build

# 5. Deploy the Channel Tabs Plugin (headless API server)
# Build the server-only tarball:
cd source/lockon-channel-tabs && python build_tar.py && cd ../..
# Deploy via System Console > Plugins > Upload Plugin

# 6. Deploy the Home Sidebar Plugin
# Build and deploy via mmctl or System Console

# 7. Open http://localhost:8065 in your browser
```

> **Windows Users:** All scripts are cross-platform. PowerShell equivalents are provided where applicable (e.g., `scripts/clean.ps1`).

## Production Deployment

```bash
# With Nginx reverse proxy + SSL + monitoring (Prometheus & Grafana)
docker compose -f docker-compose.yml \
  -f docker-compose.nginx.yml \
  -f docker-compose.production.yml up -d --build
```

> **Note:** For production, update `.env` with:
> - `DOMAIN=your.domain.com`
> - `MM_SERVICESETTINGS_SITEURL=https://your.domain.com`
> - Valid SSL certificates in `./volumes/web/cert/`

## Backup & Restore

```bash
# Create a backup (database + config)
./scripts/backup.sh

# With custom retention (30 days)
./scripts/backup.sh 30
```

Backups are saved to `./backups/` and include:
- PostgreSQL database dump (`.sql.gz`)
- Mattermost config + `.env` (`.tar.gz`)

## Deep Clean / Reset Workspace

If you want to completely wipe all data and start fresh, you can use the deep clean scripts. This will permanently delete your database and all files in `./volumes/`.

**For Windows (PowerShell):**
```powershell
.\scripts\clean.ps1
```

**For Linux/macOS:**
```bash
./scripts/clean.sh
```

## Development & Customization

As this is a fully customizable workspace, you can modify the source code and rebuild the platform:

1. **Modifying the Login Page**: Edit styles in `source/mattermost/webapp/channels/src/components/login/login.scss` and backgrounds in `source/images/loginbg/`.
2. **Modifying Channel Tabs UI**: Edit components in `source/mattermost/webapp/channels/src/components/channel_tabs/`.
3. **Modifying Home Dashboard**: Edit widgets in `source/mattermost/webapp/channels/src/components/home_dashboard/`.
4. **Modifying LOCKON AI Panel**: Edit `source/mattermost/webapp/channels/src/components/lockon_ai/`.
5. **Modifying Branding CSS**: Edit `source/mattermost/webapp/channels/src/sass/routes/_lockon-branding.scss`.
6. **Modifying Channel Tabs Backend**: Edit Go code in `source/lockon-channel-tabs/server/`, rebuild the tarball with `python build_tar.py`, and redeploy.
7. **Modifying Home Sidebar Plugin**: Edit code in `source/lockon-home-tab/`, rebuild and redeploy the plugin.
8. **Changing the Logo**: Replace the SVG file at `source/images/lockon-logo.svg` with your own vector logo.
9. **Changing Login Backgrounds**: Add or replace SVG files in `source/images/loginbg/` and update the imports in `header_footer_route.tsx`.
10. **Modifying the Core Theme**: The default "Cream Workspace" theme colors are defined in:
    `source/mattermost/webapp/channels/src/packages/mattermost-redux/src/constants/preferences.ts`
11. **Applying Full Rebuilds**:
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml build mattermost
    docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d
    ```

## Project Structure

```
LOCKON-WORKSPACE/
├── docker-compose.yml                 # Base stack (Postgres + LOCKON Workspace)
├── docker-compose.nginx.yml           # Overlay: Nginx reverse proxy + SSL
├── docker-compose.without-nginx.yml   # Overlay: Direct port expose (dev)
├── docker-compose.production.yml      # Overlay: Monitoring (Prometheus + Grafana)
├── .env                               # Environment secrets (gitignored)
├── env.example                        # Environment template
├── LICENSE                            # Project license
├── nginx/                             # Nginx configuration
├── monitoring/                        # Prometheus + Grafana configs
├── scripts/                           # Backup, maintenance & setup scripts
│   ├── backup.sh                      # Database & config backup
│   ├── clean.sh                       # Deep clean (Linux/macOS)
│   ├── clean.ps1                      # Deep clean (Windows)
│   ├── setup-workspace.sh             # Initial workspace setup
│   └── ...                            # Additional utility scripts
├── volumes/                           # Persistent data (gitignored)
├── docs/                              # Additional documentation
├── contrib/                           # Community contributions
├── .github/                           # GitHub Actions workflows
├── source/
│   ├── mattermost/                    # Cloned Mattermost source (with Core customizations)
│   ├── lockon-home-tab/               # Plugin: Home Sidebar Link (Go + React)
│   ├── lockon-channel-tabs/           # Plugin: Channel Tabs API Server (Go only)
│   ├── images/                        # Custom UI images & login backgrounds
│   │   ├── lockon-logo.svg            # LOCKON brand logo
│   │   ├── logo.svg                   # Favicon / brand mark
│   │   └── loginbg/                   # Login page background SVGs
│   ├── .dockerignore                  # Docker build context exclusions
│   └── Dockerfile                     # Multi-stage build instructions
├── .gitignore                         # Project gitignore rules
└── README.md                          # This file
```

## Monitoring

When using the production overlay, the following dashboards are available:

| Service    | URL                        | Description                |
|------------|----------------------------|----------------------------|
| LOCKON     | `https://your.domain.com`  | Team collaboration platform|
| Grafana    | `http://your.domain.com:3000` | Metrics dashboard          |

## Acknowledgments

This project is built upon [Mattermost](https://mattermost.com/) — an open-source platform for secure collaboration. We gratefully acknowledge the Mattermost team and community for creating and maintaining this excellent software.

- **Mattermost Server**: [github.com/mattermost/mattermost](https://github.com/mattermost/mattermost) (MIT License)
- **Docker Deployment**: Originally based on [github.com/mattermost/docker](https://github.com/mattermost/docker) (Apache 2.0 License)

## License

The Docker deployment configuration and custom LOCKON plugins in this repository are provided "AS-IS". 
Mattermost Team Edition is licensed under the [MIT License](https://github.com/mattermost/mattermost/blob/master/LICENSE.txt).
