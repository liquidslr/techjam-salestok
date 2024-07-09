from uuid import uuid4


def get_image_folder_path(folder_name, filename):
    ext = filename.split('.')[-1:][0]
    new_filename = uuid4().hex + '.' + ext
    return '/'.join(['image', folder_name, new_filename])


def get_document_folder_path(folder_name, filename):
    ext = filename.split('.')[-1:][0]
    new_filename = uuid4().hex + '.' + ext
    return '/'.join(['document', folder_name, new_filename])


def get_company_image_path(instance, filename):
  return get_image_folder_path('company/', filename)

def get_contact_image_path(instance, filename):
  return get_image_folder_path('contact/', filename)

def get_recording_file_path(instance, filename):
  return get_image_folder_path('recording/', filename)
   