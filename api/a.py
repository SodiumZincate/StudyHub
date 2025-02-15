import os

# Specify the root directory you want to clean
root_path = "./files"

# Function to iterate through directories and delete files
def delete_files_in_directory(path):
    # Loop through each item in the directory
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        
        try:
            if os.path.isfile(item_path):
                # If it's a file, delete it
                print(f"Deleting file: {item_path}")
                os.remove(item_path)
            elif os.path.isdir(item_path):
                # If it's a directory, recursively call the function for that directory
                print(f"Entering directory: {item_path}")
                delete_files_in_directory(item_path)
        except Exception as e:
            print(f"Error with {item_path}: {e}")

# Ensure the root path exists
if not os.path.exists(root_path):
    print(f"The path {root_path} does not exist.")
else:
    # Start cleaning the directory from the root
    delete_files_in_directory(root_path)
