#!/bin/bash
# =============================================================================
# LOCKON Workspace — Onboarding Setup Script
# =============================================================================
# Uses mmctl to configure default channels and post welcome messages.
# Run this AFTER the containers are fully started.
# =============================================================================

set -euo pipefail

echo "==> Configuring LOCKON Workspace via mmctl..."

# Ensure we are running from the docker directory
cd "$(dirname "$0")/.."

# Function to run mmctl inside the mattermost container
run_mmctl() {
    docker compose exec -T mattermost mmctl --local "$@"
}

echo "1. Renaming default channels..."
run_mmctl channel rename core:town-square "ประกาศทั่วไป" --display-name "ประกาศทั่วไป (Announcements)" || echo "Channel town-square might already be renamed."
run_mmctl channel rename core:off-topic "พูดคุยทั่วไป" --display-name "พูดคุยทั่วไป (General)" || echo "Channel off-topic might already be renamed."

echo "2. Posting Welcome Message..."
WELCOME_TEXT="🎉 **ยินดีต้อนรับสู่ LOCKON Workspace!** 🎉

พื้นที่สำหรับการทำงานและสื่อสารภายในทีมของคุณ 
- ช่อง **ประกาศทั่วไป** นี้จะถูกใช้สำหรับการประกาศข่าวสารสำคัญจากทีมงาน
- สำหรับการพูดคุยเรื่องทั่วไปหรือเรื่องสัพเพเหระ เชิญที่ช่อง **พูดคุยทั่วไป (General)** ได้เลยครับ!

*เริ่มต้นการทำงานของคุณด้วยความลื่นไหลและปลอดภัยไปกับ LOCKON Workspace*"

# Create the post in the announcements channel
run_mmctl post create core:town-square --message "$WELCOME_TEXT" || echo "Failed to post welcome message."

echo "==> Workspace setup completed successfully!"
