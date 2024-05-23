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

            const container = document.getElementById('easter-egg-container')
            const img = document.createElement('img');
            img.src = `/images/easterEgg/igiari.png`;
            img.id = 'activationImage';
            img.classList.add('easter-egg', 'hide');
            container.appendChild(img);

            const bottomDiv = document.createElement('div');
            bottomDiv.id = 'bottomElement';
            bottomDiv.classList.add('bottom-element');
            bottomDiv.innerHTML = `
                <p>Are you sure you want to change the name to ${firstName} ${lastName}?</p>
                <div>
                  <button id="yesButton" class="btn btn-primary">Yes</button>
                  <button id="noButton" class="btn btn-secondary">No</button>
                </div>
            `;
            document.body.appendChild(bottomDiv);

            document.querySelectorAll('button, select').forEach(element => {
                if (element.id !== 'yesButton' && element.id !== 'noButton') {
                    element.disabled = true;
                }
            });

            document.getElementById('yesButton').addEventListener('click', () => {
                img.src = `/images/easterEgg/matta.png`;
                shake(img.id);
                playMP3(`/sounds/${type}/${characterKey}/matta.mp3`);
                bottomDiv.innerHTML = `
                    <p>Hold it! Is this your real name, or are you just trying to make me more famous?</p>
                    <div>
                      <button id="realNameButton" class="btn btn-primary">My real name</button>
                      <button id="funButton" class="btn btn-secondary">Just for fun</button>
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
                img.src = `/images/easterEgg/kurae.png`;
                shake(img.id);
                playMP3(`/sounds/${type}/${characterKey}/kurae.mp3`);
                bgMusic.pause();
                const newBgMusic = new Audio(`/sounds/${type}/msc-pressingPursuit.mp3`);
                newBgMusic.loop = true;
                newBgMusic.play()
                    .catch(err => {
                        console.error(err);
                    });
                bottomDiv.innerHTML = `
                    <p>Anyway, take that! Save your changes!</p>
                    <div>
                    <button id="okButton" class="btn btn-primary">OK</button>
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
                    console.error(err + 'src: ' + bgMusic.src);
                });
            playMP3(`/sounds/${type}/${characterKey}/igiari.mp3`);
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
                    console.log(`Match found: ${key} (${lang}), type: ${value.type}`);
                    return {characterKey: key, type: value.type};
                }
            }
        }
    }
    console.log('No match found');
    return null;
}
