export function convertTagsToArray(tagsString) {
    // Split the string by commas, trim each tag, filter out empty strings
    return tagsString
        .split(',')                      // Split by comma
        .map(tag => tag.trim().replace(/\s+/g, '')) // Trim spaces and remove inner spaces
        .filter(tag => tag.length > 0);  // Filter out empty strings
}