import tarfile
import os

# Build a headless server-only plugin tarball (no webapp)
dst = 'lockon-channel-tabs-v3-server-only.tar.gz'
src_dir = 'dist/com.lockon.channel-tabs-v3'

# Files to include: plugin.json, server/, public/
with tarfile.open(dst, 'w:gz') as tout:
    for root, dirs, files in os.walk(src_dir):
        # Skip webapp directory entirely
        if 'webapp' in root:
            continue
        for name in files:
            filepath = os.path.join(root, name)
            arcname = os.path.relpath(filepath, 'dist')
            arcname = arcname.replace('\\', '/')
            ti = tout.gettarinfo(filepath, arcname)
            if 'plugin-linux-amd64' in name:
                ti.mode = 0o755
            else:
                ti.mode = 0o644
            
            with open(filepath, 'rb') as f:
                tout.addfile(ti, f)

print(f"Built {dst} (server-only, no webapp)")
