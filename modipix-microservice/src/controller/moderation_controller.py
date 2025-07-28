import os, shutil
from nudenet import NudeDetector

classifier = NudeDetector() # this will load model once 

def moderate_image(temp_path):
    result = classifier.detect(temp_path)
    os.remove(temp_path)
    return result
