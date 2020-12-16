import * as types from './utils/action-types';
import * as httpUtils from './utils/httpUtils';
import { login, signup } from './utils/httpUtils';
import { getSanitizedUrl } from './utils/urls';
import { removeScriptTags } from './utils/base';
import { defaultColor } from './utils/color';

global.browser = require('webextension-polyfill');

const getNotes = (tab, actionType, iconClick = false) => {
  const url = getSanitizedUrl(tab.url);
  httpUtils
    .fetchAllMyNotesByUrl(url)
    .then(notes => {
      chrome.tabs.sendMessage(tab.id, { action: actionType, iconClick: iconClick, data: notes }, response => {
        console.log(response);
      });
    })
    .catch(() => {
      // Login is required here when action is show side bar.
      if (actionType === types.SHOW_SIDE_BAR) {
        chrome.tabs.sendMessage(tab.id, { action: actionType, sub_action: types.SHOW_LOGIN, iconClick: iconClick, data: [] }, response => {
          console.log(response);
        });
      }
    });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Annotate in SaltyNote',
    id: types.WEB_NOTE_RIGHT_CLICK_MENU_ID,
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.WEB_NOTE_RIGHT_CLICK_MENU_ID) {
    console.log('right click triggered');
    chrome.tabs.sendMessage(tab.id, { action: types.RIGHT_CLICK }, response => {
      console.log(response);
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.toLowerCase().startsWith('http')) {
    getNotes(tab, types.HIGHLIGHT_ALL);
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  getNotes(tab, types.SHOW_SIDE_BAR, true);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request received:', JSON.stringify(request));

  if (request.action === types.ADD_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      text: pa.text,
      note: removeScriptTags(pa.note),
      highlight_color: pa.highlightColor || defaultColor,
      is_page_only: pa.isPageOnly || false,
      url: getSanitizedUrl(sender.tab.url),
    };
    httpUtils
      .savePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('save new page annotation successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.UPDATE_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      id: pa.id,
      text: pa.text,
      note: removeScriptTags(pa.note),
      highlight_color: pa.highlightColor || defaultColor,
    };
    httpUtils
      .updatePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('Page annotation is updated successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.DELETE_NOTE) {
    httpUtils
      .deletePageAnnotation(request.id)
      .then(res => {
        console.log('Page annotation is deleted successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.LOGIN) {
    login(request.user.username, request.user.password)
      .then(() => {
        console.log('Login succeed');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }
  if (request.action === types.LOGOUT) {
    chrome.storage.local.clear(() => {
      sendResponse({ done: true });
    });
  }
  if (request.action === types.SIGNUP) {
    signup(request.user.username, request.user.email, request.user.password)
      .then(() => {
        console.log('sign up succeed');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }
  return true;
});

chrome.commands.onCommand.addListener(command => {
  if (command === types.CMD_HIGHLIGHT_TOGGLE) {
    console.log(types.CMD_HIGHLIGHT_TOGGLE);
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_HIGHLIGHT_TOGGLE }, response => {
        console.log(response);
      });
    });
  } else if (command === types.CMD_OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => console.log('Options page is opened'));
  }
});
