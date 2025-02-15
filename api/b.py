import os

def add_vercelkeep_to_empty_dirs(root_dir):
    # Walk through all directories and subdirectories
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Check if the current directory is empty (excluding the subdirectories list)
        if not dirnames and not filenames:  # If the directory is empty
            vercelkeep_path = os.path.join(dirpath, '.vercelkeep')
            with open(vercelkeep_path, 'w') as f:
                f.write('')  # Create an empty .vercelkeep file
            print(f"Created .vercelkeep in: {dirpath}")

if __name__ == "__main__":
    root_dir = './files'
    add_vercelkeep_to_empty_dirs(root_dir)
