# Stage 1: Build the WebApp
FROM node:24-bullseye AS builder

WORKDIR /app

# Copy the entire Mattermost monorepo
COPY mattermost/ /app/

# Overwrite Mattermost assets with Custom LOCKON assets
COPY images/logo.svg /app/webapp/channels/src/images/logo.svg
COPY images/lockon-logo.svg /app/webapp/channels/src/images/lockon-logo.svg
COPY images/loginbg/ /app/webapp/channels/src/images/loginbg/

WORKDIR /app/webapp

# Install dependencies and build
RUN npm install
RUN npm run build

# Stage 2: Merge into the Official Mattermost Image
FROM mattermost/mattermost-team-edition:latest

USER root

# Copy custom built webapp (this will overwrite existing files)
COPY --chown=mattermost:mattermost --from=builder /app/webapp/channels/dist/ /mattermost/client/

USER mattermost
