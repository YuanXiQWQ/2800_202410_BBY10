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
        type: 'type1'
    },
    miaFey: {
        en: {firstName: 'Mia', lastName: 'Fey'},
        jp: {firstName: '綾里', lastName: '千尋'},
        cn: {firstName: '绫里', lastName: '千寻'},
        type: 'type1'
    }
};

function activateEasterEgg(characterKey, type, firstName, lastName) {
    return new Promise((resolve) => {
        if (!window.inActivation) {
            window.inActivation = true;

            // 创建并插入种类图片元素
            const img = document.createElement('img');
            img.src = `/images/easterEgg/igiari.png`; // 确保路径正确
            img.id = 'activationImage';
            img.classList.add('easter-egg', 'hide');
            document.body.appendChild(img);

            // 创建并插入底部元素
            const bottomDiv = document.createElement('div');
            bottomDiv.id = 'bottomElement';
            bottomDiv.classList.add('bottom-element');
            bottomDiv.innerHTML = `
                <p>Are you sure you want to change the name to ${lastName} ${firstName}?</p>
                <button id="yesButton" class="btn btn-primary">Yes</button>
                <button id="noButton" class="btn btn-secondary">No</button>
            `;
            document.body.appendChild(bottomDiv);

            // 禁用其他按钮和选择框
            document.querySelectorAll('button, select').forEach(element => {
                if (element.id !== 'yesButton' && element.id !== 'noButton') {
                    element.disabled = true;
                }
            });

            document.getElementById('yesButton').addEventListener('click', () => {
                img.src = `/images/easterEgg/matta.png`; // 切换到 matta 图片
                playMP3(`/sounds/${type}/${characterKey}/matta.mp3`);
                bottomDiv.innerHTML = `
                    <p>Hold it! Is this your real name, or are you just trying to make me more famous?</p>
                    <button id="realNameButton" class="btn btn-primary">My real name</button>
                    <button id="funButton" class="btn btn-secondary">Just for fun</button>
                `;
                document.getElementById('realNameButton').addEventListener('click', continueSubmission);
                document.getElementById('funButton').addEventListener('click', continueSubmission);
            });

            document.getElementById('noButton').addEventListener('click', () => {
                document.getElementById('firstName').value = '';
                document.getElementById('lastName').value = '';
                document.body.removeChild(bottomDiv);
                document.body.removeChild(img);
                window.inActivation = false;
                bgMusic.pause();
                document.querySelectorAll('button, select').forEach(element => {
                    element.disabled = false;
                });
            });

            function continueSubmission() {
                img.src = `/images/easterEgg/kurae.png`; // 切换到 kurae 图片
                playMP3(`/sounds/${type}/${characterKey}/kurae.mp3`);
                bgMusic.pause(); // 暂停当前背景音乐
                const newBgMusic = new Audio(`/sounds/${type}/msc-pressingPursuit.mp3`);
                newBgMusic.loop = true;
                newBgMusic.play();
                bottomDiv.innerHTML = `
                    <p>Anyway, take that! Save your changes!</p>
                    <button id="okButton" class="btn btn-primary">OK</button>
                `;
                document.getElementById('okButton').addEventListener('click', () => {
                    document.body.removeChild(bottomDiv);
                    document.body.removeChild(img);
                    window.inActivation = false;
                    newBgMusic.pause(); // 暂停新的背景音乐
                    document.querySelectorAll('button, select').forEach(element => {
                        element.disabled = false;
                    });
                    resolve(); // 结束Promise，继续表单提交
                });
            }

            // 延迟200毫秒后显示图片并添加动画效果
            setTimeout(() => {
                img.classList.remove('hide');
                if (!device.ios()) {
                    window.navigator.vibrate(400);
                }
                shake(img.id);
            }, 200);

            // 播放背景音乐
            const bgMusic = new Audio(`/sounds/${type}/msc-objection.mp3`);
            bgMusic.loop = true;
            bgMusic.play();

            // 播放 igiari 音效
            playMP3(`/sounds/${type}/${characterKey}/igiari.mp3`);
        }
    });
}

// 辅助函数：播放MP3
function playMP3(src) {
    const audio = new Audio(src);
    audio.play();
}

// 辅助函数：元素抖动效果
function shake(elementId) {
    const element = document.getElementById(elementId);
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 400);
}

// 辅助函数：检查名字是否匹配
function getMatchingCharacter(firstName, lastName) {
    for (const [key, value] of Object.entries(translations)) {
        for (const [lang, name] of Object.entries(value)) {
            if ((name.firstName === firstName && name.lastName === lastName) ||
                (name.firstName === lastName && name.lastName === firstName)) {
                return {characterKey: key, type: value.type};
            }
        }
    }
    return null;
}
