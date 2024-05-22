function activateEasterEgg(type, firstName, lastName) {
    return new Promise((resolve) => {
        if (!window.inActivation) {
            try {
                clearTimeout(window.activationTimer);
            } catch (e) {
            }

            window.inActivation = true;

            // 创建并插入种类图片元素
            const img = document.createElement('img');
            img.src = `/images/igiari.png`; // 确保路径正确
            img.id = 'activationImage';
            img.classList.add('easter-egg', 'hide');
            document.body.appendChild(img);

            // 创建并插入底部元素
            const bottomDiv = document.createElement('div');
            bottomDiv.id = 'bottomElement';
            bottomDiv.classList.add('bottom-element');
            bottomDiv.innerHTML = `
                <p>Are you sure you want to change the name to ${firstName} ${lastName}?</p>
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
                playMP3(`/sounds/${type}/matta.mp3`);
                bottomDiv.innerHTML = `
                    <p>Is this your real name, or are you just trying to make me more famous?</p>
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
                window.inActivation = false;
                document.querySelectorAll('button, select').forEach(element => {
                    element.disabled = false;
                });
            });

            function continueSubmission() {
                playMP3(`/sounds/${type}/kurae.mp3`);
                bottomDiv.innerHTML = `
                    <p>Anyway, save your changes!</p>
                    <button id="okButton" class="btn btn-primary">OK</button>
                `;
                document.getElementById('okButton').addEventListener('click', () => {
                    document.body.removeChild(bottomDiv);
                    window.inActivation = false;
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

            // 自动播放音乐
            setTimeout(() => {
                playMP3(`/sounds/msc-objection.mp3`);
                playMP3(`/sounds/${type}/igiari.mp3`); // 确保路径正确
            }, 200);

            // 设置计时器在一定时间后恢复初始状态
            window.activationTimer = setTimeout(() => {
                if (window.inActivation) {
                    img.classList.add('hide');
                    setTimeout(() => {
                        img.remove();
                    }, 400); // 给图片隐藏动画一些时间

                    document.querySelectorAll('button, select').forEach(element => {
                        element.disabled = false;
                    });

                    window.inActivation = false;
                    resolve(); // 结束Promise
                }
                try {
                    clearTimeout(window.activationTimer);
                } catch (e) {
                }
            }, 17000);
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
