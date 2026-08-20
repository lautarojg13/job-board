#!/bin/sh

set -e

MODEL="${OLLAMA_MODEL_NAME:?OLLAMA_MODEL_NAME is required}"

echo "Starting ollama server..."
ollama serve &
SERVER_PID=$!

for i in $(seq 1 30); do
  if ollama list >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! ollama list | grep -q "^${MODEL} "; then
  echo "Pulling model ${MODEL}..."
  ollama pull "$MODEL"
fi

echo "Ollama ready. Model: ${MODEL}"
wait "$SERVER_PID"