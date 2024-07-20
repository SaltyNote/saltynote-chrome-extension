# SaltyNote <small>Chrome Extension</small>

> Check [zhouhao/saltynote-chrome-extension-cloudflare](https://github.com/zhouhao/saltynote-chrome-extension-cloudflare) for further updates.


[![Codacy Badge](https://app.codacy.com/project/badge/Grade/62a09c3bb28d4f5b882eb6c01dad6ea4)](https://app.codacy.com/gh/SaltyNote/saltynote-chrome-extension/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FSaltyNote%2Fsaltynote-chrome-extension.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FSaltyNote%2Fsaltynote-chrome-extension?ref=badge_shield)

![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/baanghljiehhpljdbonfknboakpfajnn)
![Chrome Web Store](https://img.shields.io/chrome-web-store/rating-count/baanghljiehhpljdbonfknboakpfajnn)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/baanghljiehhpljdbonfknboakpfajnn)

`SaltyNote` can be a very useful **Chrome Extension**, with which, you can easily annotate any text in any page with your comments.

> [Website](https://saltynote.com/)
> 
> [Chrome Web Store](https://chrome.google.com/webstore/detail/saltynote/baanghljiehhpljdbonfknboakpfajnn)
> 
> [Documentation](https://saltynote.github.io/saltynote-chrome-extension/) & [Blog Post](https://hzhou.me/2023/04/22/saltynote-implementation-chrome-extension/)

## Overview
![Overview](https://raw.githubusercontent.com/zhouhao/SaltyNote-Overview-Slides/master/assets/chrome-extension-overview.png)

## Get Started

1. Make a copy of [`env.example.json`](./env.example.json), and rename it to `env.json`.
1. Make a copy of [`src/icons-example`](./src/icons-example), and rename it to `src/icons`.
1. Run `npm run build`, then a `dist` folder will be generated.
1. Go to [chrome://extensions/](chrome://extensions/) page in Chrome, enable `developer mode`, and load the extension from [`dist`](./dist) folder.
   ![](./docs/images/chrome.png)

## License

MIT
