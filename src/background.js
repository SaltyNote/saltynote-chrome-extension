import * as types from './utils/action-types';
import * as httpUtils from './utils/httpUtils';
import { getSanitizedUrl } from './utils/urls';
import { removeScriptTags } from './utils/base';
import { defaultColor } from './utils/color';
import { login, signup } from './utils/httpUtils';

global.browser = require('webextension-polyfill');

const getNotes = (tab, actionType) => {
  const url = getSanitizedUrl(tab.url);
  httpUtils
    .fetchAllMyNotesByUrl(url)
    .then(notes => {
      chrome.tabs.sendMessage(tab.id, { action: actionType, data: notes }, response => {
        console.log(response);
      });
    })
    .catch(() => {
      // Login is required here.
      chrome.tabs.sendMessage(tab.id, { action: actionType, sub_action: types.SHOW_LOGIN, data: [] }, response => {
        console.log(response);
      });
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

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.url && tab.url.toLowerCase().startsWith('http')) {
//     getNotes(tab, types.HIGHLIGHT_ALL);
//   }
// });

chrome.browserAction.onClicked.addListener(tab => {
  getNotes(tab, types.SHOW_SIDE_BAR);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request received:', JSON.stringify(request));
  // refreshAuthInfo()
  //   .then(user => {
  //     // simple filter for remove script tags
  //     if (request && request.note) {
  //       request.note = removeScriptTags(request.note);
  //     }
  //
  //     if (request.action === types.ADD_NOTE) {
  //       const pa = request.pageAnnotation;
  //       const pageAnnotation = {
  //         text: pa.text,
  //         note: pa.note,
  //         highlightColor: pa.highlightColor || defaultColor,
  //         isCustom: pa.isCustom || false,
  //         url: getSanitizedUrl(sender.tab.url),
  //         timestamp: new Date().getTime(),
  //       };
  //       // TODO: save note
  //     }
  //     if (request.action === types.DELETE_NOTE) {
  //       // TODO: delete note
  //     }
  //     if (request.action === types.UPDATE_NOTE) {
  //       if (!request.pageAnnotation.id) return;
  //       note = {
  //         note: removeScriptTags(request.pageAnnotation.note || ''),
  //         highlightColor: request.pageAnnotation.highlightColor || defaultColor,
  //         timestamp: new Date().getTime(),
  //       };
  //       // TODO: UPDATE note
  //     }
  //   })
  //   .then(() => sendResponse({ done: 'true' }));
  if (request.action === types.LOGIN) {
    login(request.user.username, request.user.password)
      .then(() => {
        console.log('Login succeed');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
      })
      .catch(e => console.error(e));
  }
  if (request.action === types.SIGNUP) {
    signup(request.user.username, request.user.email, request.user.password)
      .then(() => {
        console.log('sign up succeed');
      })
      .catch(e => console.error(e));
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
