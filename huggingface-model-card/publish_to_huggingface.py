"""
CableHunt Networks Limited (cablehunt.co.uk)
Automated Publisher for Hugging Face Model Hub: https://huggingface.co/sassil/cablehunt-optical-ai
Uploads the official Smart Optical AI Model Card (confirming 2029 public weights release), config.json, and model_architecture.py.
"""

import os
import pathlib
import sys

try:
    from dotenv import load_dotenv
    load_dotenv(pathlib.Path.home() / ".env")
    load_dotenv()
except ImportError:
    pass


def load_hf_token() -> str:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if token:
        return token.strip()
    env_file = pathlib.Path.home() / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("HF_TOKEN="):
                return line.split("=", 1)[1].strip()
    return ""


def main():
    token = load_hf_token()
    if not token:
        print("[ERROR] HF_TOKEN not found in environment or ~/.env.")
        sys.exit(1)

    try:
        from huggingface_hub import HfApi
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "huggingface_hub"])
        from huggingface_hub import HfApi

    api = HfApi(token=token)
    user_info = api.whoami()
    username = user_info.get("name", "sassil")
    repo_id = f"{username}/cablehunt-optical-ai"
    folder_path = pathlib.Path(__file__).resolve().parent

    print(f"[INFO] Creating / verifying Hugging Face model repository: {repo_id} ...")
    api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True, private=False)

    for filename in ["README.md", "config.json", "model_architecture.py"]:
        file_path = folder_path / filename
        if file_path.exists():
            print(f"[UPLOAD] Pushing {filename} to {repo_id} ...")
            api.upload_file(
                path_or_fileobj=str(file_path),
                path_in_repo=filename,
                repo_id=repo_id,
                repo_type="model",
                commit_message=f"Publish CableHunt Smart Optical AI {filename} (Confirmed 2029 Public Weights Release)"
            )

    print(f"[SUCCESS] Live on Hugging Face: https://huggingface.co/{repo_id}")


if __name__ == "__main__":
    main()
