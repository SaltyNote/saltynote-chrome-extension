<template>
  <div id="crx-side-bar" class="card text-white" v-show="showSideBar">
    <div class="card-header bg-primary text-center border-primary">
      SaltyNote
      <button type="button" class="close" aria-label="Close" @click="closeSideBar">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="card-body text-primary overflow-auto">
      <template v-if="showLogin">
        <div class="form-signin">
          <img class="mb-4" src="chrome-extension://baanghljiehhpljdbonfknboakpfajnn/icons/icon.png" alt="" width="72" height="72" />
          <h1 class="h3 mb-3 font-weight-normal">Please Login</h1>
          <label class="sr-only">Username</label>
          <input type="text" class="form-control" placeholder="Username" required autofocus />
          <label class="sr-only">Password</label>
          <input type="password" class="form-control" placeholder="Password" required />
          <button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
          <p>
            Don't have an account?
            <a
              class="link-mouse"
              @click="
                showLogin = false;
                showSignup = true;
              "
              >Sign Up</a
            >
          </p>
        </div>
      </template>
      <template v-else-if="showSignup">
        <div class="form-signin">
          <img class="mb-4" src="chrome-extension://baanghljiehhpljdbonfknboakpfajnn/icons/icon.png" alt="" width="72" height="72" />
          <h1 class="h3 mb-3 font-weight-normal">Please Signup</h1>
          <label class="sr-only">Username</label>
          <input type="text" class="form-control" placeholder="Username" required autofocus />
          <label class="sr-only">Email</label>
          <input type="email" class="form-control" placeholder="Your Email" required autofocus />
          <label class="sr-only">Password</label>
          <input type="password" class="form-control" placeholder="Password" required />
          <button class="btn btn-lg btn-primary btn-block" type="submit">Signup</button>
          <p>
            Have An Account ?
            <a
              class="link-mouse"
              @click="
                showLogin = true;
                showSignup = false;
              "
              >Login</a
            >!
          </p>
        </div>
      </template>
      <template v-else-if="notes.length > 0">
        <div class="list-group">
          <a href="javascript:void(0)" @click="noteHighlight(note)" class="list-group-item list-group-item-action" v-for="(note, index) in notes" :key="note.id">
            <template v-if="note.isCustom">
              <label class="text-primary">{{ note.text }}</label>
            </template>
            <template v-else>
              <SelectedTextBlockquote :text="note.text" :class="colorClass(note.highlightColor)" />
            </template>
            <div class="form-group">
              <template v-if="note.showSave">
                <ColorSelect v-if="!note.isCustom" :color="getNoteHighlightColor(note)" @update:color="note.newHighlightColor = $event"></ColorSelect>
                <textarea class="form-control" rows="3" v-model="note.note"></textarea>
              </template>
              <div class="shadow-none p-3 bg-light rounded" v-else v-html="markdown(note.note)"></div>
            </div>
            <div class="row my-btn-group">
              <div class="col-md-6">
                <small>{{ note.timestamp }}</small>
              </div>
              <div class="offset-md-3 col-md-3">
                <template v-if="!note.showSave">
                  <a href="javascript:void(0)" class="del-btn" @click.stop="deleteMyNote(note.id)">
                    <fa-icon icon="trash-alt" />
                  </a>
                  <a href="javascript:void(0)" @click.stop="enableEdit(index)">
                    <fa-icon icon="edit" />
                  </a>
                </template>
                <template v-else>
                  <a href="javascript:void(0)" @click.stop="cancelUpdate(index)">
                    <fa-icon icon="undo" />
                  </a>
                  <a href="javascript:void(0)" style="color:green;" @click.stop="updateNote(note.id, index)">
                    <fa-icon icon="cloud-upload-alt" />
                  </a>
                </template>
              </div>
            </div>
          </a>
        </div>
      </template>
      <template v-else>
        <NoAnnotationPlaceholder />
      </template>
      <CustomAnnotationCard v-show="showCustomNoteWindow" @hide:CustomAnnotationCard="showCustomNoteWindow = false" />
    </div>

    <div class="card-footer text-muted text-center">
      <a href="#" title="Add Notes without Select Context" @click.prevent="showCustomNote"> Add Custom Note</a>
    </div>
  </div>
</template>

<script>
import CustomAnnotationCard from './CustomAnnotationCard';
import NoAnnotationPlaceholder from './NoAnnotationPlaceholder';
import ColorSelect from './ColorSelect';
import { colorToClassName, defaultColor } from '../../utils/color';
import * as types from '../../utils/action-types';
import { deletePageAnnotation, loadPageAnnotations, updatePageAnnotation } from '../../utils/page-annotation';
import { highlight } from '../../utils/highlight-mark';
import { mdRender } from '../../utils/md';
import SelectedTextBlockquote from './SelectedTextBlockquote';

export default {
  name: 'SideBar',
  components: { SelectedTextBlockquote, NoAnnotationPlaceholder, CustomAnnotationCard, ColorSelect },
  data() {
    return {
      notes: [],
      showSideBar: false,
      showCustomNoteWindow: false,
      showLogin: false,
      showSignup: false,
    };
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === types.SHOW_SIDE_BAR) {
        if (!this.showSideBar) {
          this.showCustomNoteWindow = false;
        }
        this.showSideBar = true;
        this.showLogin = this.showSignup = false; // Reset first.
        if (request.sub_action === types.SHOW_LOGIN) {
          this.showLogin = true;
        } else {
          this.notes = loadPageAnnotations(request.data);
        }
      }
      sendResponse({ done: true });
      return true;
    });
  },
  methods: {
    colorClass(color) {
      return colorToClassName(color);
    },
    getNoteHighlightColor(note) {
      if (note.highlightColor) {
        return note.highlightColor;
      }
      return defaultColor;
    },
    closeSideBar() {
      this.showSideBar = false;
      this.$emit('hide:sidebar');
    },
    // This is a hack for v-for re-rendering:
    // https://vuejs.org/v2/guide/list.html#Mutation-Methods
    refreshNotesForRendering() {
      this.notes.push({});
      this.notes.pop();
    },
    toggleSave(index, showSave) {
      const note = this.notes[index];
      note.showSave = showSave;
      this.refreshNotesForRendering();
    },
    enableEdit(index) {
      this.toggleSave(index, true);
    },
    cancelUpdate(index) {
      this.toggleSave(index, false);
    },
    updateNote(noteId, index) {
      console.log('note = ', this.notes[index]);
      const note = this.notes[index];
      if (note.base_note === note.note && (!note.newHighlightColor || note.highlightColor === note.newHighlightColor)) {
        this.cancelUpdate(index);
      } else {
        note.highlightColor = note.newHighlightColor;
        updatePageAnnotation(note).then(() => {
          this.toggleSave(index, false);
        });
      }
    },
    noteHighlight(note) {
      // if it is a custom note, no need to highlight it in current page
      if (note.isCustom) {
        return;
      }
      highlight(note);
      const el = document.getElementById(note.id);
      if (el) {
        document.getElementById(note.id).scrollIntoView();
      }
    },
    showCustomNote() {
      const topOffSet = document.querySelector('#crx-side-bar .card-header').offsetHeight;
      const bottomOffSet = document.querySelector('#crx-side-bar .card-footer').offsetHeight;
      document.querySelector('#crx-side-bar .custom-note-box').setAttribute('style', 'top:' + topOffSet + 'px');
      document.querySelector('#crx-side-bar .custom-note-body').setAttribute('style', 'bottom:' + (topOffSet + bottomOffSet) + 'px');
      this.showCustomNoteWindow = true;
    },
    deleteMyNote(noteId) {
      if (confirm('Sure to delete this note?')) {
        deletePageAnnotation(noteId).then(() => {
          console.log('Page annotation is deleted');
        });
      }
    },
    markdown(val) {
      return mdRender(val);
    },
  },
};
</script>

<style scoped lang="scss">
$zIndex: 9999;
#crx-side-bar {
  height: 100vh;
  width: 400px;
  position: fixed;
  background-color: #ffffff;
  z-index: $zIndex;
  right: 0;
  box-shadow: -12px 0px 25px 0px rgba(0, 0, 0, 0.75);
  border-radius: 10px;

  .my-note {
    font-weight: normal;
  }

  .my-btn-group {
    a:first-child {
      margin-right: 10px;
    }

    .del-btn {
      color: red;
    }
  }

  .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: auto;
    text-align: center;
  }
  .form-signin .checkbox {
    font-weight: 400;
  }
  .form-signin .form-control {
    position: relative;
    box-sizing: border-box;
    height: auto;
    padding: 10px;
    font-size: 16px;
  }
  .form-signin .form-control:focus {
    z-index: 2;
  }
  .form-signin input[type='text'] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
  .form-signin input[type='email'] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
  .form-signin input[type='password'] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .link-mouse {
    cursor: pointer;
    text-decoration: none;
  }
}

.my-note path {
  fill: red;
}
</style>
