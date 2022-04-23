import * as types from './action-types';
import * as baseUtils from './base';

/* pageAnnotation = {
   text: web page selected content
   note: User comment about above selected text
   isPageOnly: if true, it means this annotation is added manually, not from selecting text, e.g. for google docs, annotation on selected text does not work
   highlightColor: the color used to highlight the selected text in web page
 }

 valid pageAnnotation should have at least text or note.
 */

const isPageAnnotationValid = pageAnnotation => {
  return pageAnnotation && (pageAnnotation.text || pageAnnotation.note);
};

export const submitPageAnnotation = pageAnnotation => {
  return new Promise(function(resolve, reject) {
    if (!isPageAnnotationValid(pageAnnotation)) {
      reject(new Error('pageAnnotation should have at least selected text or custom note(comment).'));
      return;
    }
    const payload = {
      action: types.ADD_NOTE,
      pageAnnotation: pageAnnotation,
    };
    chrome.runtime.sendMessage(payload, response => {
      console.log(response);
      resolve();
    });
  });
};

export const updatePageAnnotation = pageAnnotation => {
  return new Promise(function(resolve, reject) {
    if (!isPageAnnotationValid(pageAnnotation) || !pageAnnotation.id) {
      reject(new Error('pageAnnotation to update should have its id and at least selected text or custom note(comment).'));
      return;
    }
    chrome.runtime.sendMessage({ pageAnnotation: pageAnnotation, action: types.UPDATE_NOTE }, response => {
      console.log(response);
      resolve();
    });
  });
};

export const deletePageAnnotation = pageAnnotationId => {
  return new Promise(function(resolve, reject) {
    if (baseUtils.isBlank(pageAnnotationId)) {
      reject(new Error('Page Annotation id should be positive number!'));
      return;
    }
    chrome.runtime.sendMessage({ id: pageAnnotationId, action: types.DELETE_NOTE }, response => {
      console.log(response);
      resolve();
    });
  });
};

export const searchPageAnnotations = keyword => {
  return new Promise(function(resolve, reject) {
    if (baseUtils.isBlank(keyword)) {
      reject(new Error('Keyword should not be empty!'));
      return;
    }
    chrome.runtime.sendMessage({ keyword: keyword, action: types.SEARCH }, response => {
      resolve(response);
    });
  });
};
