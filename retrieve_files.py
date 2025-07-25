import subprocess
import os
import shutil

# --- Configuration ---
# The commit message to search for.
# This needs to be an exact match to a part of the commit message.
COMMIT_MESSAGE = "working full authentication,user,onboarding,no premindex,imge not stored in bucket"

# The name of the directory where the retrieved files will be saved.
OUTPUT_DIR = "retrived best project"

def get_commit_hash(commit_message):
    """Finds the full commit hash for a given commit message."""
    print(f"Searching for commit with message: '{commit_message}'...")
    try:
        # Command to find the commit hash by its message.
        # --all searches all branches.
        # -i makes the search case-insensitive.
        command = [
            'git', 'log', '--all', '--grep', f'^{commit_message}$', 
            '--format=%H', '-n', '1'
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8')
        
        commit_hash = result.stdout.strip()
        if not commit_hash:
            print("Error: No commit found with that exact message.")
            return None
            
        print(f"✅ Success! Found commit hash: {commit_hash}")
        return commit_hash
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running git log: {e.stderr}")
        return None
    except FileNotFoundError:
        print("Error: 'git' command not found. Is Git installed and in your system's PATH?")
        return None

def get_changed_files(commit_hash):
    """Gets a list of all files added, modified, or renamed in a specific commit."""
    print(f"\nFinding all files changed in commit {commit_hash[:7]}...")
    try:
        # Command to list all files that were part of the commit.
        # `git diff-tree` is a low-level command perfect for this.
        # --no-commit-id: Suppresses the commit ID output.
        # --name-only: Shows only the file paths.
        # -r: Recurses into subtrees to find all changed files.
        command = ['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit_hash]
        result = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8')
        
        files = result.stdout.strip().split('\n')
        if not files or not files[0]:
            print("Warning: No files were found to be changed in this commit.")
            return []
            
        print(f"✅ Success! Found {len(files)} changed files.")
        return files
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running git diff-tree: {e.stderr}")
        return []

def copy_files_to_output_dir(file_list, output_dir):
    """Copies a list of files to a new directory, preserving structure."""
    if not file_list:
        print("\nNo files to copy. Exiting.")
        return

    print(f"\nPreparing to copy files to '{output_dir}'...")
    
    # Create the main output directory if it doesn't exist.
    if os.path.exists(output_dir):
        print(f"Directory '{output_dir}' already exists. Files will be overwritten if they conflict.")
    else:
        os.makedirs(output_dir)
        print(f"Created directory: '{output_dir}'")

    copied_count = 0
    for file_path in file_list:
        source_path = os.path.normpath(file_path)
        destination_path = os.path.join(output_dir, source_path)
        
        # Check if the source file actually exists before trying to copy
        if not os.path.exists(source_path):
            print(f"  - Skipping '{source_path}' (it may have been deleted in a later commit).")
            continue

        # Create the necessary subdirectories within the output folder.
        destination_folder = os.path.dirname(destination_path)
        if not os.path.exists(destination_folder):
            os.makedirs(destination_folder)
        
        # Copy the file, preserving metadata like modification time.
        shutil.copy2(source_path, destination_path)
        print(f"  - Copied '{source_path}'")
        copied_count += 1
        
    print(f"\n✅ All done! Copied {copied_count} files into '{output_dir}'.")


if __name__ == "__main__":
    # --- Main Execution ---
    commit_hash = get_commit_hash(COMMIT_MESSAGE)
    
    if commit_hash:
        changed_files = get_changed_files(commit_hash)
        copy_files_to_output_dir(changed_files, OUTPUT_DIR) 