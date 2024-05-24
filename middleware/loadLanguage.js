import fs from 'fs';
import path from 'path';

export const loadLanguage = (req, res, next) => {
    const language = req.session.userData.language || 'en-UK';
    const languageFilePath = path.join(__dirname, '../public/languages', `${language}.json`);

    fs.readFile(languageFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading language file:', err);
            res.locals.language = {};
        } else {
            res.locals.language = JSON.parse(data);
        }
        next();
    });
};
