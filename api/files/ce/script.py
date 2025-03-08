import os

def create_vercelkeep_in_leaf_dirs(directory):
    # Walk through the directory and its subdirectories
    for root, dirs, files in os.walk(directory):
        # If the current directory has no subdirectories, it's a leaf directory
        if not dirs:
            vercelkeep_path = os.path.join(root, '.vercelkeep')
            
            # If .vercelkeep doesn't already exist, create it
            if not os.path.exists(vercelkeep_path):
                with open(vercelkeep_path, 'w') as vercelkeep_file:
                    vercelkeep_file.write("")  # Create an empty file
                print(f"Created: {vercelkeep_path}")
            else:
                print(f"Already exists: {vercelkeep_path}")

if __name__ == "__main__":
    folder_to_process = './sem2'  # Replace with the folder you want to process
    create_vercelkeep_in_leaf_dirs(folder_to_process)
