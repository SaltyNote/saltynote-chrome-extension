<template>
  <div class="saltynote">
    <!-- Annotation Popup Component-->
    <AnnotationCard />
    <!-- highlight popup-->
    <template v-for="(note, noteId) in highlight.popover">
      <div :style="{ top: note.top + 'px', left: note.left + 'px' }" class="shadow bg-light rounded card crx-highlight-card" :key="noteId">
        <div class="card-body">
          <button type="button" class="close" aria-label="Close" @click="deleteHighlightPopover(noteId)">
            <span aria-hidden="true">&times;</span>
          </button>
          <div class="card-text" v-html="note.comment" />
        </div>
      </div>
    </template>
    <!-- Side Bar Component-->
    <SideBar @hide:sidebar="closeSideBar" />
    <Search v-if="showSearch" />
  </div>
</template>

<script>
import * as types from '../utils/action-types';
import { highlightAll, unmark } from '../utils/highlight-mark';
import { mdRender } from '../utils/md';
import AnnotationCard from './components/AnnotationCard';
import SideBar from './components/SideBar';
import Search from './components/Search';
import { EventBus } from '../utils/event-bus';

export default {
  name: 'App',
  components: { Search, SideBar, AnnotationCard },
  data() {
    return {
      showSideBar: false,
      notes: [],
      showCustomNoteWindow: false,
      showSearch: false,
      errorMsg: '',
      highlight: {
        doneForPageLoad: false,
        cmdToggle: false,
        popover: {},
      },
    };
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === types.HIGHLIGHT_ALL) {
        // do not trigger highlight all after adding new note
        // only trigger it when page refresh
        if (this.highlight.doneForPageLoad) return;
        console.log(types.HIGHLIGHT_ALL);
        this.notes = request.data;
        this.notes.forEach(note => (note.clickCallback = this.highlightClick));
        highlightAll(this.notes);
        this.highlight.doneForPageLoad = true;
        this.highlight.cmdToggle = true;
      }
      if (request.action === types.CMD_HIGHLIGHT_TOGGLE) {
        if (this.highlight.cmdToggle) {
          unmark();
          this.highlight.popover = [];
        } else {
          highlightAll(this.notes);
        }
        this.highlight.cmdToggle = !this.highlight.cmdToggle;
      } else if (request.action === types.CMD_GLOBAL_SEARCH) {
        this.showSearch = !this.showSearch;
      }
      sendResponse({ done: true });
      return true;
    });
  },
  created() {
    EventBus.$on(types.CLOSE_SEARCH, () => {
      this.showSearch = false;
    });
  },
  methods: {
    changeHighlightColor(color) {
      this.highlight.color = color;
      console.log('highlight.color = ', this.highlight.color);
    },
    deleteHighlightPopover(noteId) {
      this.$delete(this.highlight.popover, noteId);
    },
    highlightClick(note, event) {
      console.log('highlightClick...');
      this.$set(this.highlight.popover, note.id, {
        left: event.pageX,
        top: event.pageY,
        id: note.id,
        comment: mdRender(note.note),
      });
    },
    closeSideBar() {
      unmark();
      this.highlight.cmdToggle = false;
    },
  },
};
</script>

<style lang="scss">
$zIndex: 9999;
.saltynote {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;

  z-index: $zIndex;

  .error-msg {
    color: red;
  }

  div.crx-highlight-card.card {
    position: absolute;
    z-index: $zIndex - 10;
    min-width: 250px !important;

    .card-body {
      padding: 0 10px;
    }
  }
}
</style>
