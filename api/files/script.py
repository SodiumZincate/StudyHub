import os
import json

# This function will recursively traverse the directory structure
def traverse_directory(path, current_path=""):
    directory_links = {}

    # List all directories in the current directory
    try:
        # Get directories in the current directory
        directories = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
        
        # Iterate through directories and traverse deeper
        for directory in directories:
            # Construct the current path as "sem1/maths/assignment"
            new_path = os.path.join(current_path, directory)

            print(f"Now processing: {new_path}")

            # Create an empty array for each directory where you'll fill in URLs and names later
            directory_links[new_path] = [
                {
                    "url": "",  # Placeholder for URL to be filled manually
                    "name": ""  # Placeholder for Name to be filled manually
                }
            ]

            # Recursively call traverse_directory to go deeper into subdirectories
            subdirectory_links = traverse_directory(os.path.join(path, directory), new_path)
            # Merge subdirectory links if any
            directory_links.update(subdirectory_links)

    except PermissionError:
        print(f"Permission denied for {path}")
    
    return directory_links


# Main function to start the process
def main():
    root_directory = input("Enter the root directory (e.g., '/path/to/sem1'): ")
    if not os.path.isdir(root_directory):
        print(f"Error: The directory '{root_directory}' does not exist.")
        return

    print(f"Traversing directory structure from: {root_directory}")
    
    # Initialize the directoryLinks dictionary
    directory_links = {}

    # Start the recursive traversal
    directory_links.update(traverse_directory(root_directory))

    # Convert the directory structure to JSON format
    json_output = json.dumps(directory_links, indent=2)

    # Optionally, save the output to a JSON file
    with open("directoryLinks.json", "w") as json_file:
        json_file.write(json_output)
    
    print("\nDirectory structure has been saved to 'directoryLinks.json'. Please manually add URLs and names.")


# Run the script
if __name__ == "__main__":
    main()
