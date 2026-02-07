import json
import os
from sentence_transformers import SentenceTransformer
import numpy as np

# --- CONFIGURATION ---
INPUT_FILE = "../public/movies_data.json"
OUTPUT_FILE = "../public/movies_vectors.json"
# Had l-model houwa a7san wahed l-l3arbiya w l-ngliziya (Multilingual)
MODEL_NAME = 'paraphrase-multilingual-MiniLM-L12-v2'

def generate_vectors():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: {INPUT_FILE} mal9itouch!")
        return

    print(f"🚀 Loading model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)

    print(f"📂 Reading {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        movies = json.load(f)

    # N-diro l-wasf (Overview) f list wa7da bach n-encoding-iwha
    # Kan-jm3o l-ngliziya w l-3arbiya bach l-AI y-fhem koulchi
    texts = []
    for m in movies:
        text = f"{m.get('overview_en', '')} {m.get('overview_ar', '')}"
        texts.append(text)

    print(f"🧠 Calculating vectors for {len(movies)} items... (Hada ghadi y-akhd waqt)")
    # Had l-marhala kat-sthlk l-CPU/GPU
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)

    print("💾 Saving embeddings to JSON...")
    for i, m in enumerate(movies):
        # Kan-hwwlo l-vector l-list bach n-9dro n-khznouh f JSON
        m['embedding'] = embeddings[i].tolist()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(movies, f, ensure_ascii=False)

    print(f"✨ Safi! File jdid mojoud: {OUTPUT_FILE}")
    print(f"💡 Size dyal l-file ghadi ikoun kbir, goul l-dev y-st3mel IndexedDB.")

if __name__ == "__main__":
    generate_vectors()