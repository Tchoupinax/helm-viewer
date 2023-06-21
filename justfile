default: build

build:
  npx ncc build src/index.ts -o binary
  cp src/index.html binary/index.html

make-executable:
  echo '{ "main": "binary/index.js", "output": "binary/sea-prep.blob" }' > binary/sea-config.json
  cp $(command -v node) binary/helm_template
  node --experimental-sea-config binary/sea-config.json
  # macOS only
  codesign --remove-signature binary/helm_template
  npx postject binary/helm_template NODE_SEA_BLOB binary/sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
  # macOS only
  codesign --sign - binary/helm_template
