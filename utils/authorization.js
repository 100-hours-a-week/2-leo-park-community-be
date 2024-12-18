// /backend/utils/authorization.js

export function isAuthor(resourceAuthor, requestAuthor) {
    return resourceAuthor === requestAuthor;
}


