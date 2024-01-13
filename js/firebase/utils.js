function getModelByName(snapshot, name) {
    for(key in snapshot) {
        if (snapshot[key].Name === name) {
            //cheap trick to append the key to the model data
            return { ...snapshot[key], key: key };
        }   
    }

    return undefined;
} 