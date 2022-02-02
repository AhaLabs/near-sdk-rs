#!/bin/bash
TARGET="${CARGO_TARGET_DIR:-target}"
set -e
cd "`dirname $0`"
cargo install --git https://github.com/ahalabs/witgen --rev 1aca670c8c4589a214a7e9e1e79bd9a89001870e cargo-witgen
cargo install --git https://github.com/ahalabs/wit-bindgen --rev e37ff328de87bcb222c923396c91def0db5e9b0f wit-bindgen-cli
cargo build --target wasm32-unknown-unknown --release
cp $TARGET/wasm32-unknown-unknown/release/status_message.wasm ./res/
#wasm-opt -Oz --output ./res/status_message.wasm ./res/status_message.wasm

cargo witgen generate --prefix-file ../../near-sdk/witgen.wit
wit-bindgen js-near -i ./witgen.wit --out-dir res/