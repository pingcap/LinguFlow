import importlib
import os


def import_plugins(directory):
    """
    Recursively imports Python modules from the given directory.

    Args:
        directory (str): The directory path containing Python files to import.

    Notes:
        This function skips files named '__init__.py' and imports only files ending with '.py'.
    """
    for file_name in os.listdir(directory):
        # Skip __init__.py
        if file_name == "__init__.py":
            continue
        file_path = os.path.join(directory, file_name)
        if os.path.isdir(file_path):
            # Recursively import files in subdirectories
            import_plugins(file_path)
        elif file_name.endswith(".py"):
            module_path = f"plugins.{os.path.relpath(file_path, 'plugins')[:-3].replace(os.sep, '.')}"
            importlib.import_module(module_path)


import_plugins(os.path.dirname(__file__))
