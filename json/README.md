## This directoy is indeed to store json formatted firebase credentials

# Generel notice:
    Always run `gsutil cors set <cors-json-file> gs://<bucket_name>...`
    It is recommened to change the cors files configuration to your will when releasing to production
    cause `cors.json` is not production ready and can lead to security vulnerabilities