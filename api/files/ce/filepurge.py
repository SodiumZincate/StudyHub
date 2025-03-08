import os

def delete_files_except_directories(directory):
    deleted_files = []  # List to store deleted file paths
    
    # Walk through the directory and its subdirectories
    for root, dirs, files in os.walk(directory, topdown=False):
        # Delete all files in the current directory (including PDFs and other files)
        for file in files:
            file_path = os.path.join(root, file)
            os.remove(file_path)
            deleted_files.append(file_path)  # Add deleted file path to list
    
    return deleted_files

if __name__ == "__main__":
    folder_to_clean = './sem4'  # Replace with the folder you want to clean
    deleted_files = delete_files_except_directories(folder_to_clean)
    
    # Print the list of deleted files
    if deleted_files:
        print("Deleted files:")
        for file in deleted_files:
            print(file)
    else:
        print("No files were deleted.")
