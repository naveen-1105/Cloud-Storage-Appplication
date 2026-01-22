import { ObjectId } from "mongodb"

export function validateId(req, res, next, id) {
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID!" });
    }
    next();
}