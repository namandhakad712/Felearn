Of course, Naman! Let's get this script running. Here is a simple step-by-step guide.

Step 1: Where to Put the File
You need to save the Python script inside your main project folder. This is the top-level folder of your project that contains the hidden .git directory.

For you, this is your Felearn folder.

Felearn/
├── .git/
├── src/
├── package.json
├── README.md
└── (SAVE THE SCRIPT HERE) ⬅️
Step 2: What to Name the File
You can name the file anything you like, but let's use a simple name.

Name: retrieve_my_files.py

Step 3: How to Run It
Open your terminal or command prompt (like Git Bash, Command Prompt, or PowerShell).

Navigate into your project folder using the cd command.

Bash

cd path/to/your/Felearn
Run the script using the python command:

Bash

python retrieve_my_files.py
What Happens Next?
The script will start running in your terminal. You will see the progress lines you asked for, and when it's finished, you'll find a new folder named retrieved_best_project inside your Felearn directory. This new folder will contain only the files from that specific commit.


Sources and related content




CODE------------------------------------------------------------------------------------

import subprocess
import os
import shutil

# --- Configuration ---
# This script is specifically configured for Naman's 'Felearn' project.
# It targets the exact commit message you confirmed.
COMMIT_MESSAGE = "working full authentication,user,onboarding,no premindex,imge not stored in bucket"

# The name of the directory where the retrieved files will be saved.
OUTPUT_DIR = "retrieved_best_project"


def get_commit_hash(commit_message):
    """Finds the full commit hash for the specific commit message (case-insensitive)."""
    print(f"Searching for your specific commit...")
    try:
        command = [
            'git', 'log', '--all', '--grep', commit_message,
            '--format=%H', '-n', '1', '-i'
        ]
        result = subprocess.run(
            command, capture_output=True, text=True, check=True, encoding='utf-8'
        )
        
        commit_hash = result.stdout.strip()
        if not commit_hash:
            print(f"Error: Could not find the commit. Make sure you are in the 'Felearn' project folder.")
            return None
            
        print(f"✅ Success! Found commit hash: {commit_hash[:7]}")
        return commit_hash
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running git log: {e.stderr}")
        return None
    except FileNotFoundError:
        print("Error: 'git' command not found. Is Git installed and in your system's PATH?")
        return None


def get_added_modified_files(commit_hash):
    """Gets a list of files that were ADDED or MODIFIED in the commit."""
    print(f"\nFinding files added or modified in the commit...")
    try:
        command = ['git', 'diff-tree', '--no-commit-id', '--name-status', '-r', commit_hash]
        result = subprocess.run(
            command, capture_output=True, text=True, check=True, encoding='utf-8'
        )
        
        files_to_retrieve = []
        for line in result.stdout.strip().split('\n'):
            if not line: continue
            status, file_path = line.split('\t', 1)
            if status.upper() != 'D': # Ignore deleted files
                files_to_retrieve.append(file_path)
        
        if not files_to_retrieve:
            print("Warning: No files were added or modified in this commit.")
            return []
            
        print(f"✅ Success! Found {len(files_to_retrieve)} relevant files.")
        return files_to_retrieve
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running git diff-tree: {e.stderr}")
        return []


def retrieve_files_from_commit(commit_hash, file_list, output_dir):
    """Retrieves the specific version of each file from the commit history with progress."""
    if not file_list:
        print("\nNo files to retrieve. Exiting.")
        return

    print(f"\nPreparing to retrieve files into '{output_dir}'...")
    
    if os.path.exists(output_dir):
        print(f"Directory '{output_dir}' already exists. Clearing it for a fresh copy.")
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    print(f"Created clean directory: '{output_dir}'")

    retrieved_count = 0
    total_files = len(file_list)
    
    # Header for the progress output
    print(f"\nRetrieving {total_files} files:")

    # Loop through files with an index for progress tracking
    for i, file_path in enumerate(file_list):
        try:
            destination_path = os.path.join(output_dir, os.path.normpath(file_path))
            destination_folder = os.path.dirname(destination_path)
            os.makedirs(destination_folder, exist_ok=True)

            # Use 'git show' to get the raw content of the file at that specific commit.
            command = ['git', 'show', f'{commit_hash}:{file_path}']
            file_content = subprocess.run(command, capture_output=True, check=True).stdout
            
            with open(destination_path, 'wb') as f:
                f.write(file_content)
            
            retrieved_count += 1
            # --- NEW: This is the progress line you requested ---
            print(f"  ({retrieved_count}/{total_files}) Retrieved '{file_path}'")

        except subprocess.CalledProcessError:
            # Also show progress for skipped files
            print(f"  ({i + 1}/{total_files}) Warning: Could not retrieve '{file_path}'. Skipping.")
        
    print(f"\n✅ All done! Successfully retrieved {retrieved_count} of {total_files} files into '{output_dir}'.")


if __name__ == "__main__":
    # --- Main Execution ---
    commit_hash = get_commit_hash(COMMIT_MESSAGE)
    
    if commit_hash:
        files_to_retrieve = get_added_modified_files(commit_hash)
        retrieve_files_from_commit(commit_hash, files_to_retrieve, OUTPUT_DIR)







-----------------------------------------------------------------------------------