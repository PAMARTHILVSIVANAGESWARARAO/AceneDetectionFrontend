import os

def aggregate_src_files(root_dir, output_file):
    # Folders we definitely want to skip
    ignored_folders = {'node_modules', '.git', '__pycache__'}
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Walking through the directory
        for root, dirs, files in os.walk(root_dir):
            # Modifying dirs in-place to skip ignored folders
            dirs[:] = [d for d in dirs if d not in ignored_folders]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                # Optional: Add specific file extensions you want to include
                # if not file.endswith(('.js', '.json', '.md')): continue

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # Writing the format: File Path \n Content
                        outfile.write(f"FILE PATH: {file_path}\n")
                        outfile.write("-" * 40 + "\n")
                        outfile.write(content)
                        outfile.write("\n\n" + "="*60 + "\n\n")
                        
                    print(f"Successfully read: {file_path}")
                except Exception as e:
                    print(f"Could not read {file_path}: {e}")

if __name__ == "__main__":
    # Point this to your src directory
    target_directory = './src'
    output_filename = 'project_content_summary.txt'
    
    aggregate_src_files(target_directory, output_filename)
    print(f"\nDone! All content is saved in: {output_filename}")