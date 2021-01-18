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
        <Login
          @show:signup="
            showLogin = false;
            showSignup = true;
          "
        />
      </template>
      <template v-else-if="showSignup">
        <Signup
          @show:login="
            showLogin = true;
            showSignup = false;
          "
        />
      </template>
      <template v-else-if="notes.length > 0">
        <div class="list-group">
          <a href="javascript:void(0)" @click="noteHighlight(note)" class="list-group-item list-group-item-action" v-for="(note, index) in notes" :key="note.id">
            <template v-if="note.isPageOnly">
              <label class="text-primary">{{ note.text }}</label>
            </template>
            <template v-else>
              <SelectedTextBlockquote :text="note.text" :class="colorClass(note.highlightColor)" />
            </template>
            <div class="form-group">
              <template v-if="note.showSave">
                <ColorSelect v-if="!note.isPageOnly" :color="getNoteHighlightColor(note)" @update:color="note.newHighlightColor = $event"></ColorSelect>
                <textarea class="form-control" rows="3" v-model="note.note"></textarea>
              </template>
              <div class="shadow-none p-3 bg-light rounded" v-else v-html="markdown(note.note)"></div>
            </div>
            <div class="row my-btn-group">
              <div class="col-md-6">
                <small>{{ readableTime(note.createdTime) }}</small>
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
    <template v-if="!(showLogin || showSignup)">
      <div class="card-footer text-muted text-center">
        <a href="#" title="Add Notes without Select Context" @click.prevent="showCustomNote"> Add Page Note</a>
      </div>
      <div class="card-footer text-muted bg-warning text-center logout">
        <a href="#" title="Logout" @click.prevent="logout"> Logout</a>
      </div>
    </template>
  </div>
</template>

<script>
import CustomAnnotationCard from './CustomAnnotationCard';
import NoAnnotationPlaceholder from './NoAnnotationPlaceholder';
import ColorSelect from './ColorSelect';
import { colorToClassName, defaultColor } from '../../utils/color';
import * as types from '../../utils/action-types';
import { deletePageAnnotation, updatePageAnnotation } from '../../utils/page-annotation';
import { highlight } from '../../utils/highlight-mark';
import { mdRender } from '../../utils/md';
import { readableTimestamp } from '../../utils/base';
import SelectedTextBlockquote from './SelectedTextBlockquote';
import Signup from './Signup';
import Login from './Login';

export default {
  name: 'SideBar',
  components: { Login, Signup, SelectedTextBlockquote, NoAnnotationPlaceholder, CustomAnnotationCard, ColorSelect },
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
        if (request.iconClick) {
          this.showSideBar = !this.showSideBar;
        } else {
          this.showSideBar = true;
        }
        this.showLogin = this.showSignup = false; // Reset first.
        if (this.showSideBar) {
          if (request.sub_action === types.SHOW_LOGIN) {
            this.showLogin = true;
          } else {
            this.notes = request.data;
          }
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
      if (note.isPageOnly) {
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
          this.notes = this.notes.filter(n => noteId !== n.id);
        });
      }
    },
    markdown(val) {
      return mdRender(val);
    },
    readableTime(ts) {
      return readableTimestamp(ts);
    },
    logout() {
      if (confirm('Sure to logout?')) {
        chrome.runtime.sendMessage({ action: types.LOGOUT }, response => {
          this.showLogin = true;
          return true;
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
$zIndex: 9999;
div#crx-side-bar.card.text-white {
  height: 100vh;
  width: 400px !important;
  position: fixed;
  background-color: #ffffff;
  z-index: $zIndex;
  right: 0;
  box-shadow: -12px 0px 25px 0px rgba(0, 0, 0, 0.75);
  border-radius: 10px;

  .card-header {
    color: white !important;
  }

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

  .logout a {
    color: red;
    font-style: italic;
  }
}

.my-note path {
  fill: red;
}
</style>
