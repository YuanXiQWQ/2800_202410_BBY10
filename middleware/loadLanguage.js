import fs from 'fs';
import path from 'path';

/**
 * Function to load the language file.
 *
 * @param req - HTTP request object.
 * @param res - HTTP response object.
 * @param next - Next middleware function.
 */
export const loadLanguage = (req, res, next) => {
    let language = 'en-uk';

    if (req.query.lang) {
        language = req.query.lang;
        req.session.language = language;
    } else if (req.session.userData && req.session.userData.preferredLanguage) {
        language = req.session.userData.preferredLanguage;
    } else if (req.session.language) {
        language = req.session.language;
    }

    const languageFilePath = path.join(process.cwd(), 'public', 'languages', `${language}.json`);
    fs.readFile(languageFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error(`Could not read language file: ${err.message}`);
            next(err);
        } else {
            res.locals.language = JSON.parse(data);
            next();
        }
    });
};
