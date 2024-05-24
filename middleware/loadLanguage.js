import fs from 'fs';
import path from 'path';

export const loadLanguage = (req, res, next) => {
    let language = 'en-uk';

    if (req.session.userData && req.session.userData.preferredLanguage) {
        language = req.session.userData.preferredLanguage;
    } else if (req.query.lang) {
        language = req.query.lang;
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
