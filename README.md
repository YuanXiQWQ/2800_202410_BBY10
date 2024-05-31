# NexGenFit

---

## Table of Contents

- [About the Project](#about-the-project)
- [Names of Contributors](#names-of-contributors)
- [Technologies and Resources Used](#technologies-and-resources-used)
- [How to Run This Project](#how-to-run-this-project)
- [The Features of This Project](#the-features-of-this-project)
- [Licenses](#licenses)
- [References](#references)
- [AI Usage Declaration](#ai-usage-declaration)
- [Limitations Encountered](#limitations-encountered)
- [Contact Information](#contact-information)
- [Project file tree](#project-file-tree)

---

## About the Project

Our project, **BBY-10**, is developing an AI-powered fitness app to help individuals who struggle with planning or
maintaining proper form during their fitness journey. Our solution offers personalised workout plans, goal setting, and
progress tracking through a user-friendly calendar interface. Additionally, users can monitor their form in real-time by
integrating AI technology and the MoveNet API.

## Names of Contributors

| **Team Name**    | 
|------------------|
| **BBY-10**       |
| **Team Members** |
| Matthew Wing     |
| Jason Liu        |
| Amal Allaham     |
| Jiarui Xing      |

## Technologies and Resources Used

List technologies (with version numbers), API, icons, fonts, images, media or data sources, and other resources that
were used.

* **HTML**, **CSS**, **JavaScript**
* **Bootstrap v5.0** (Frontend library)
* **Firebase v10.9.0** (BAAS - Backend as a Service)
* **Node.js v20.11.1**, **npm v10.2.4**, **ECMAScript model**, **EJS view template** (JS in Server)
* **OpenAI** (AI API), **MoveNet** (Move Track API), **FullCalendar** (Calendar API)
* **Microsoft Edge**, **Google Chrome** (Browser)
* **Git v2.44.0.windows.1**, **GitHub**, **GitKraken v9.13.0** (Version control)
* **Adobe Photoshop 2023** (For Icons and Logo)
* **JetBrains WebStorm v2024.1**, **Microsoft Visual Studio Code** (IDE)
* **Microsoft Windows 10 22H2**, **11** (OS)

---

## How to Run This Project

### Developing:

1. **Terminal**: `npm i node -g`
2. **Terminal**: `npm i`
3. Ask admin for `.env` file
4. **Terminal**: `npm start`
5. **Browser**: Search [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:3000](http://127.0.0.1:3000)
6. **MongoDB**: Ask admin for permission if you need

- APIs require detail: see [package.json](./package.json)
- We suggest using **Google Chrome** or **Microsoft Edge**

### Using:

1. **Browser**: [NexGenFit](https://two800-202410-bby10-9pkb.onrender.com)

---

## The Features of This Project

- AI personalised fitness plan.
- Real-time motion tracking.
- Multi-languages support.
- AI generating exercises plan.
- Personalised editing of personal information.

## Licenses

Project follows the [MIT License](./LICENSE)

## References

| Main page                               | Docs                                |
|-----------------------------------------|-------------------------------------|
| [MoveNet](https://www.tensorflow.org)   | [API](https://www.tensorflow.org/)  |
| [FullCalendar](https://fullcalendar.io) | [API](https://fullcalendar.io/docs) |
| [OpenAi](https://openai.com/)           | [API](https://platform.openai.com/) |

## AI Usage Declaration

- This program uses AI to generate some code to speed up the process. For example, if there are three similar pages, one
  is created manually, sent to the AI, requirements are specified, and the AI generates the other two, which are then
  manually modified.
- Personal information will be uploaded to **GPT-3.5 Turbo** to generate fitness plan data.
- Didn't use AI to create data sets or clean data sets.

## Limitations Encountered

1. **Time constraint**: We only have five weeks, which is relatively tight.
2. **Personnel constraint**: The team originally had five members, but one person left, leaving us with four members. We
   had to evenly distribute the extra work of the fifth person.

## Contact Information

**GitHub**:
[Issues](https://github.com/YuanXiQWQ/2800_202410_BBY10/issues)
[Discussions](https://github.com/YuanXiQWQ/2800_202410_BBY10/discussions)

**Email**: 2800202410bby10@gmail.com

---

## Project file tree

```
├── .env
├── .gitignore
├── controller
│   ├── auth.js
│   ├── chatgptIntegration.js
│   ├── easterEgg.js
│   ├── exercises.js
│   ├── login.js
│   ├── password.js
│   ├── profile.js
│   └── prompt.js
├── db.js
├── index.js
├── LICENSE
├── middleware
│   ├── authorization.js
│   └── loadLanguage.js
├── model
│   ├── ChatGPT.js
│   ├── exercises.js
│   └── User.js
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── fonts
│   │   ├── RedditMono-Black.ttf
│   │   ├── RedditMono-Bold.ttf
│   │   ├── RedditMono-ExtraBold.ttf
│   │   ├── RedditMono-ExtraLight.ttf
│   │   ├── RedditMono-Light.ttf
│   │   ├── RedditMono-Medium.ttf
│   │   ├── RedditMono-Regular.ttf
│   │   └── RedditMono-SemiBold.ttf
│   ├── images
│   │   ├── circle.png
│   │   ├── easterEgg
│   │   │   ├── en
│   │   │   │   ├── igiari.png
│   │   │   │   ├── kurae.png
│   │   │   │   └── matta.png
│   │   │   ├── jp
│   │   │   │   ├── igiari.png
│   │   │   │   ├── kurae.png
│   │   │   │   └── matta.png
│   │   │   └── zh
│   │   │       ├── igiari.png
│   │   │       ├── kurae.png
│   │   │       └── matta.png
│   │   ├── home.png
│   │   ├── icon.png
│   │   ├── la.png
│   │   ├── login.png
│   │   ├── logo_NexGenFit.png
│   │   ├── logo_NexGenFit_all_noBackground.png
│   │   ├── logo_NexGenFit_main_noBackground.png
│   │   ├── plank.png
│   │   ├── squat.png
│   │   ├── stretch-girl.png
│   │   ├── userAvatar_default.png
│   │   ├── validation-error.jpg
│   │   └── workoutphoto.jpg
│   ├── languages
│   │   ├── ar.json
│   │   ├── de.json
│   │   ├── en-uk.json
│   │   ├── es.json
│   │   ├── fa.json
│   │   ├── fr.json
│   │   ├── it.json
│   │   ├── ja.json
│   │   ├── ko.json
│   │   ├── pt.json
│   │   ├── ru.json
│   │   ├── zh-cn.json
│   │   └── zh-tw.json
│   ├── scripts
│   │   ├── calendar.js
│   │   ├── home.js
│   │   └── loadLanguageScript.js
│   ├── sounds
│   │   ├── type1
│   │   │   ├── en
│   │   │   │   ├── msc-objection.mp3
│   │   │   │   └── msc-pressingPursuit.mp3
│   │   │   ├── msc-objection.mp3
│   │   │   ├── msc-pressingPursuit.mp3
│   │   │   └── phoenixWright
│   │   │       ├── en
│   │   │       │   ├── igiari.mp3
│   │   │       │   ├── kurae.mp3
│   │   │       │   └── matta.mp3
│   │   │       ├── jp
│   │   │       │   ├── igiari.mp3
│   │   │       │   ├── kurae.mp3
│   │   │       │   └── matta.mp3
│   │   │       └── zh
│   │   │           ├── igiari.mp3
│   │   │           ├── kurae.mp3
│   │   │           └── matta.mp3
│   │   ├── type2
│   │   │   ├── apolloJustice
│   │   │   │   ├── en
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   ├── jp
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   └── zh
│   │   │   │       ├── igiari.mp3
│   │   │   │       ├── kurae.mp3
│   │   │   │       └── matta.mp3
│   │   │   ├── msc-objection.mp3
│   │   │   └── msc-pressingPursuit.mp3
│   │   ├── type3
│   │   │   ├── athenaCykes
│   │   │   │   ├── en
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   ├── jp
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   └── zh
│   │   │   │       ├── igiari.mp3
│   │   │   │       ├── kurae.mp3
│   │   │   │       └── matta.mp3
│   │   │   ├── msc-objection.mp3
│   │   │   └── msc-pressingPursuit.mp3
│   │   ├── type4
│   │   │   ├── milesEdgeworth
│   │   │   │   ├── en
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   ├── jp
│   │   │   │   │   ├── igiari.mp3
│   │   │   │   │   ├── kurae.mp3
│   │   │   │   │   └── matta.mp3
│   │   │   │   └── zh
│   │   │   │       ├── igiari.mp3
│   │   │   │       ├── kurae.mp3
│   │   │   │       └── matta.mp3
│   │   │   ├── msc-objection.mp3
│   │   │   └── msc-pressingPursuit.mp3
│   │   └── type5
│   │       ├── miaFey
│   │       │   ├── en
│   │       │   │   ├── igiari.mp3
│   │       │   │   ├── kurae.mp3
│   │       │   │   └── matta.mp3
│   │       │   ├── jp
│   │       │   │   ├── igiari.mp3
│   │       │   │   ├── kurae.mp3
│   │       │   │   └── matta.mp3
│   │       │   └── zh
│   │       │       ├── igiari.mp3
│   │       │       ├── kurae.mp3
│   │       │       └── matta.mp3
│   │       ├── msc-objection.mp3
│   │       └── msc-pressingPursuit.mp3
│   ├── styles
│   │   ├── 404.css
│   │   ├── about.css
│   │   ├── additional-info.css
│   │   ├── calendar.css
│   │   ├── common.css
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── loading.css
│   │   ├── login.css
│   │   ├── profile.css
│   │   ├── signup.css
│   │   ├── style.css
│   │   └── train.css
│   └── uploads
│       └── w6TCvMKKw6jClcK+w6XCqMKcMi5wbmc=
├── README.md
└── views
    ├── 404.ejs
    ├── about.ejs
    ├── additional-info.ejs
    ├── calendar.ejs
    ├── changeLanguage.ejs
    ├── changePassword.ejs
    ├── deleteAccount.ejs
    ├── editUserAvatar.ejs
    ├── forgetPassword.ejs
    ├── home.ejs
    ├── index.ejs
    ├── loading.ejs
    ├── login.ejs
    ├── newExerciseList.ejs
    ├── personalInformation.ejs
    ├── profile.ejs
    ├── resetPassword.ejs
    ├── signup.ejs
    ├── templates
    │   ├── footer.ejs
    │   ├── header.ejs
    │   └── navbar.ejs
    ├── train-plank.ejs
    ├── train-squat.ejs
    ├── validationError.ejs
    ├── workouts.ejs
    └── workoutSettings.ejs
```
