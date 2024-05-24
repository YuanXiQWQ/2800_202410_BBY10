const translations = {
    phoenixWright: {
        en: {firstName: 'Phoenix', lastName: 'Wright'},
        jp: {firstName: '成歩堂', lastName: '龍一'},
        cn: {firstName: '成步堂', lastName: '龙一'},
        type: 'type1'
    },
    apolloJustice: {
        en: {firstName: 'Apollo', lastName: 'Justice'},
        jp: {firstName: '王泥喜', lastName: '法介'},
        cn: {firstName: '王泥喜', lastName: '法介'},
        type: 'type2'
    },
    athenaCykes: {
        en: {firstName: 'Athena', lastName: 'Cykes'},
        jp: {firstName: '希月', lastName: '心音'},
        cn: {firstName: '希月', lastName: '心音'},
        type: 'type3'
    },
    milesEdgeworth: {
        en: {firstName: 'Miles', lastName: 'Edgeworth'},
        jp: {firstName: '御剣', lastName: '怜侍'},
        cn: {firstName: '御剑', lastName: '怜侍'},
        type: 'type4'
    },
    miaFey: {
        en: {firstName: 'Mia', lastName: 'Fey'},
        jp: {firstName: '綾里', lastName: '千尋'},
        cn: {firstName: '绫里', lastName: '千寻'},
        type: 'type5'
    }
};

const languagePaths = {
    'en': 'en',
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh',
    'ja': 'jp',
    'default': 'jp'
};

/**
 * Function to get the language data from the HTML element
 *
 * @return {{}|any} the language data from the HTML element or an empty object
 */
function getLanguageData() {
    try {
        const languageDataElement = document.getElementById('languageData');
        if (languageDataElement) {
            console.log("Raw language data:", languageDataElement.textContent); // 调试信息
            const data = JSON.parse(languageDataElement.textContent);
            console.log("Parsed language data:", data); // 调试信息
            return data;
        } else {
            console.error('Language data element not found');
            return {};
        }
    } catch (error) {
        console.error('Error parsing language data:', error);
        return {};
    }
}

/**
 * Activate Easter Egg
 *
 * @param characterKey the key of the character
 * @param type the type of the character
 * @param firstName the first name of the character
 * @param lastName the last name of the character
 * @return {Promise<unknown>} a promise
 */
function activateEasterEgg(characterKey, type, firstName, lastName) {
    return new Promise((resolve) => {
        if (!window.inActivation) {
            window.inActivation = true;

            const languageData = getLanguageData();
            const container = document.getElementById('easter-egg-container');
            const img = document.createElement('img');
            const langPath = languagePaths[document.documentElement.lang] || languagePaths['default'];
            img.src = `/images/easterEgg/${langPath}/igiari.png`;
            img.id = 'activationImage';
            img.classList.add('easter-egg', 'hide');
            container.appendChild(img);

            const bottomDiv = document.createElement('div');
            bottomDiv.id = 'bottomElement';
            bottomDiv.classList.add('bottom-element');

            let nameDisplay = `${firstName} ${lastName}`;
            if (['zh', 'ja', 'ko'].includes(langPath)) {
                nameDisplay = `${lastName} ${firstName}`;
            }

            bottomDiv.innerHTML = `
                <p>${languageData.areYouSureYouWantToChangeName} ${nameDisplay}?</p>
                <div>
                  <button id="yesButton" class="btn btn-primary">${languageData.yes || 'Yes'}</button>
                  <button id="noButton" class="btn btn-secondary">${languageData.no || 'No'}</button>
                </div>
            `;
            document.body.appendChild(bottomDiv);

            document.querySelectorAll('button, select').forEach(element => {
                if (element.id !== 'yesButton' && element.id !== 'noButton') {
                    element.disabled = true;
                }
            });

            document.getElementById('yesButton').addEventListener('click', () => {
                img.src = `/images/easterEgg/${langPath}/matta.png`;
                shake(img.id);
                playMP3(`/sounds/${type}/${characterKey}/${langPath}/matta.mp3`);
                bottomDiv.innerHTML = `
                    <p>${languageData.holdItIsThisYourRealName}</p>
                    <div>
                      <button id="realNameButton" class="btn btn-primary">${languageData.myRealName || 'My real name'}</button>
                      <button id="funButton" class="btn btn-secondary">${languageData.justForFun || 'Just for fun'}</button>
                    </div>
                `;
                document.getElementById('realNameButton').addEventListener('click', continueSubmission);
                document.getElementById('funButton').addEventListener('click', continueSubmission);
            });

            document.getElementById('noButton').addEventListener('click', () => {
                document.getElementById('firstName').value = '';
                document.getElementById('lastName').value = '';
                document.body.removeChild(bottomDiv);
                container.removeChild(img);
                window.inActivation = false;
                bgMusic.pause();
                document.querySelectorAll('button, select').forEach(element => {
                    element.disabled = false;
                });
            });

            function continueSubmission() {
                img.src = `/images/easterEgg/${langPath}/kurae.png`;
                shake(img.id);
                playMP3(`/sounds/${type}/${characterKey}/${langPath}/kurae.mp3`);
                bgMusic.pause();
                const newBgMusic = new Audio(`/sounds/${type}/msc-pressingPursuit.mp3`);
                newBgMusic.loop = true;
                newBgMusic.play()
                    .catch(err => {
                        console.error(err);
                    });
                bottomDiv.innerHTML = `
                    <p>${languageData.anywayTakeThatSaveYourChanges}</p>
                    <div>
                    <button id="okButton" class="btn btn-primary">${languageData.ok || 'OK'}</button>
                    </div>
                `;
                document.getElementById('okButton').addEventListener('click', () => {
                    document.body.removeChild(bottomDiv);
                    container.removeChild(img);
                    window.inActivation = false;
                    newBgMusic.pause();
                    document.querySelectorAll('button, select').forEach(element => {
                        element.disabled = false;
                    });
                    resolve();
                });
            }

            setTimeout(() => {
                container.classList.remove('hide');
                img.classList.remove('hide');
                shake(img.id);
            }, 200);

            const bgMusic = new Audio(`/sounds/${type}/msc-objection.mp3`);
            bgMusic.loop = true;
            bgMusic.play()
                .catch(err => {
                    console.error(err);
                });
            playMP3(`/sounds/${type}/${characterKey}/${langPath}/igiari.mp3`);
        }
    });
}

function shake(elemId) {
    let elem = document.getElementById(elemId);
    if (elem) {
        elem.classList.add("shake");
        setTimeout(() => {
            elem.classList.remove("shake");
        }, 800);
    }
}

/**
 * Function to play an MP3 file
 *
 * @param src the source of the MP3
 */
function playMP3(src) {
    const audio = new Audio(src);
    audio.play()
        .catch(err => {
            console.error(err);
        });
}

/**
 * Function to get the matching character from the translations object
 *
 * @param firstName the first name of the character
 * @param lastName the last name of the character
 * @return {{characterKey: string, type: string | *}|null} the matching character or null
 */
function getMatchingCharacter(firstName, lastName) {
    console.log(`Checking for character match: ${firstName} ${lastName}`);
    for (const [key, value] of Object.entries(translations)) {
        for (const [lang, name] of Object.entries(value)) {
            if (typeof name === 'object') {
                const firstNameCheck = name.firstName.toLowerCase();
                const lastNameCheck = name.lastName.toLowerCase();
                console.log(`Checking against: ${name.firstName} ${name.lastName} in ${lang}`);
                if (
                    (firstName.toLowerCase() === firstNameCheck && lastName.toLowerCase() === lastNameCheck) ||
                    (firstName.toLowerCase() === lastNameCheck && lastName.toLowerCase() === firstNameCheck)
                ) {
                    console.log(`Match found: ${key} (${lang})`);
                    return {characterKey: key, type: value.type};
                }
            }
        }
    }
    console.log('No match found');
    return null;
}
