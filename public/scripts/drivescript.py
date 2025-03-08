import os
import json
import pickle
import re
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

        # If it's a folder, recurse
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


def clean_semester_prefix(directory_links):
    """Remove semester prefix (e.g., '1st Sem', '2nd Sem', etc.) from folder paths."""
    cleaned_links = {}
    
    # Regex pattern to match '1st Sem', '2nd Sem', '3rd Sem', etc.
    pattern = r'^\d{1,2}(st|nd|rd|th) Sem/'

    for folder_path, files in directory_links.items():
        # Remove the prefix (e.g., '1st Sem/', '2nd Sem/', etc.)
        cleaned_path = re.sub(pattern, '', folder_path)
        cleaned_links[cleaned_path] = files
        
    return cleaned_links


def save_directory_links(directory_links):
    with open('directoryLinks.json', 'w') as json_file:
        json.dump(directory_links, json_file, indent=2)
    print("\nDirectory structure has been saved to 'directoryLinks.json'.")


def main():
    try:
        service = authenticate_google_drive()
        print("Fetching Google Drive directory structure...")

        directory_links = list_drive_files(service)

        # Clean semester prefixes from the path
        cleaned_directory_links = clean_semester_prefix(directory_links)

        # Sort files in each folder alphabetically by name
        for folder in cleaned_directory_links:
            cleaned_directory_links[folder] = sorted(cleaned_directory_links[folder], key=lambda x: x['name'])

        if MODIFY_JSON:
            save_directory_links(cleaned_directory_links)
        else:
            print(json.dumps(cleaned_directory_links, indent=2))

    except HttpError as error:
        print(f"An error occurred: {error}")


if __name__ == '__main__':
    main()
