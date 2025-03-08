"""
CableHunt Networks Limited (cablehunt.co.uk)
Automated Publisher for Hugging Face Model Hub: https://huggingface.co/sassil70/cablehunt-optical-ai
Uploads the official Smart Optical AI Model Card (confirming 2029 public weights release) and config.json.
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


def main():
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if not token:
        print("[ERROR] HF_TOKEN not found in environment or ~/.env.")
        print("Please save your Hugging Face Write Token first, then re-run this script.")
        sys.exit(1)

    try:
        from huggingface_hub import HfApi
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "huggingface_hub"])
        from huggingface_hub import HfApi

    api = HfApi(token=token)
    repo_id = "sassil70/cablehunt-optical-ai"
    folder_path = pathlib.Path(__file__).resolve().parent

    print(f"[INFO] Creating / verifying Hugging Face model repository: {repo_id} ...")
    api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True, private=False)

    for filename in ["README.md", "config.json"]:
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
