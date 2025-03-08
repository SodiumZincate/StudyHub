import os
import json
import pickle
import google.auth
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request

# If modifying the file, set to True. Otherwise, set to False.
MODIFY_JSON = True

# Define the scopes needed for your API requests
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Authenticate and build the API client
def authenticate_google_drive():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=3005)

        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('drive', 'v3', credentials=creds)


def list_drive_files(service, folder_id='root', base_path=''):
    query = f"'{folder_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    items = results.get('files', [])

    directory_links = {}
    
    for item in items:
        name = item['name']
        file_id = item['id']
        mime_type = item['mimeType']

        if mime_type == 'application/vnd.google-apps.folder':
            folder_path = os.path.join(base_path, name)
            sub_directory_links = list_drive_files(service, item['id'], folder_path)
            directory_links.update(sub_directory_links)
        else:
            folder_path = base_path  # Keep only the parent directory, not the file name
            if folder_path not in directory_links:
                directory_links[folder_path] = []
            directory_links[folder_path].append({
                'url': f"https://drive.google.com/file/d/{file_id}/view?usp=drive_link",
                'name': name
            })

    return directory_links


def remove_root_from_keys(directory_links):
    """Removes the root folder from keys in the directory structure."""
    all_keys = list(directory_links.keys())

    if not all_keys:
        return directory_links  # No files found

    # Find the root directory prefix by getting the longest common prefix
    root_prefix = os.path.commonprefix(all_keys).strip('/')

    if root_prefix:
        trimmed_links = {key[len(root_prefix) + 1:] if key.startswith(root_prefix) else key: value for key, value in directory_links.items()}
    else:
        trimmed_links = directory_links

    return trimmed_links


def save_directory_links(directory_links):
    with open('directoryLinks.json', 'w') as json_file:
        json.dump(directory_links, json_file, indent=2)
    print("\nDirectory structure has been saved to 'directoryLinks.json'.")


def main():
    try:
        service = authenticate_google_drive()
        print("Fetching Google Drive directory structure...")
        
        directory_links = list_drive_files(service)
        
        # Remove root directory from keys
        trimmed_directory_links = remove_root_from_keys(directory_links)

        # Sort files in each folder alphabetically by name
        for folder in trimmed_directory_links:
            trimmed_directory_links[folder] = sorted(trimmed_directory_links[folder], key=lambda x: x['name'])

        if MODIFY_JSON:
            save_directory_links(trimmed_directory_links)
        else:
            print(json.dumps(trimmed_directory_links, indent=2))

    except HttpError as error:
        print(f"An error occurred: {error}")


if __name__ == '__main__':
    main()
