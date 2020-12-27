**disclaimer**: This document is more about my personal understanding about [Chrome Extension](https://developer.chrome.com/docs/extensions/). Please feel free to correct me by opening an issue if you
see anything wrong.

### Chrome Extension has 3 parts:

1. [Content Scripts](https://developer.chrome.com/docs/extensions/mv2/content_scripts/)
2. [Background Scripts](https://developer.chrome.com/docs/extensions/mv2/background_pages/)
3. [Options Page](https://developer.chrome.com/docs/extensions/mv2/options/)

## Content Scripts

> Content scripts are files that run in the context of web pages.

As a screenshot below, the right sidebar and annotation popup window are created by `Content Scripts`.

In saltynote extension, the `Content Scripts` will not interact with saltynote service directly. Instead, it will send different types of [messages](https://developer.chrome.com/docs/extensions/mv2/messaging/) to `Background Scripts`, then `Background Scripts`
will send corresponding requests to service, and pass service response to `Content Scripts` through messages.

![Content Scripts](./images/content-scripts-section.png)

## Background Scripts

`Background Scripts` are used to handle browser events. In saltynote extension, it will:

1. listen to events created by `Content Scripts`
2. Interact with saltynote service for data exchange

## Options Page
