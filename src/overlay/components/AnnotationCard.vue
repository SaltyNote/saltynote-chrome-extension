<template>
  <div ref="noteCard" id="crx-comment-card" :style="{ top: top + 'px', left: left + 'px' }" v-show="showAnnotationCard" class="card">
    <div class="text-white card-header bg-primary" @mousedown="dragNoteCard">
      &nbsp;SaltyNote
      <button type="button" class="close" aria-label="Close" @click="closeCard">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="card-body">
      <form>
        <div class="form-group">
          <SelectedTextBlockquote :text="selectText" :class="highlightClass" />
          <ColorSelect :color="highlightColor" @update:color="changeHighlightColor"></ColorSelect>
          <textarea class="form-control" rows="3" placeholder="Your Notes Here" v-model="myComment"></textarea>
        </div>
        <span class="error-msg" v-if="errorMsg"> {{ errorMsg }}</span>
        <button type="submit" class="btn btn-primary float-right" @click.prevent.stop="submitNewNote">Add (ctrl + s)</button>
      </form>
    </div>
  </div>
</template>

<script>
import ColorSelect from './ColorSelect';
import { colorToClassName, defaultColor } from '../../utils/color';
import $ from 'jquery';
import * as types from '../../utils/action-types';
import { submitPageAnnotation } from '../../utils/page-annotation';
import SelectedTextBlockquote from './SelectedTextBlockquote';

export default {
  name: 'AnnotationCard',
  components: { SelectedTextBlockquote, ColorSelect },
  data() {
    return {
      showAnnotationCard: false,
      selectText: '',
      myComment: '',
      highlightColor: defaultColor,
      errorMsg: '',
      top: 0,
      left: 0,
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0,
      },
      mouseEvent: {},
    };
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === types.RIGHT_CLICK) {
        this.movePopupNearSelection();
      }
      sendResponse({ done: true });
      return true;
    });
    document.querySelector('body').addEventListener('mouseup', event => {
      this.mouseEvent = event;
      // Check whether alt key is pressed to avoid noise.
      if (!event.altKey) return;
      this.movePopupNearSelection();
    });
    $(window).on('keydown', event => {
      // esc
      if (event.keyCode === 27 && this.showAnnotationCard) {
        this.showAnnotationCard = false;
      }

      // ctrl/cmd key binding
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's': {
            event.preventDefault();
            if (!this.showAnnotationCard) return;
            console.log('ctrl + s');
            this.submitNewNote();
            break;
          }
        }
      }
    });
  },
  computed: {
    highlightClass() {
      return colorToClassName(this.highlightColor);
    },
  },
  methods: {
    closeCard() {
      this.showAnnotationCard = false;
    },
    submitNewNote() {
      const pageAnnotation = {
        text: this.selectText,
        note: this.myComment,
        highlightColor: this.highlightColor,
      };
      submitPageAnnotation(pageAnnotation)
        .then(() => {
          // cleanup
          this.selectText = '';
          this.myComment = '';
          this.highlightColor = defaultColor;
          this.closeCard();
        })
        .catch(err => {
          this.errorMsg = err.message;
        });
    },
    dragNoteCard(event) {
      event.preventDefault();
      // get the mouse cursor position at startup:
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      event.preventDefault();
      this.positions.movementX = this.positions.clientX - event.clientX;
      this.positions.movementY = this.positions.clientY - event.clientY;
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      // set the element's new position:
      this.$refs.noteCard.style.top = this.$refs.noteCard.offsetTop - this.positions.movementY + 'px';
      this.$refs.noteCard.style.left = this.$refs.noteCard.offsetLeft - this.positions.movementX + 'px';
    },
    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    },
    movePopupNearSelection() {
      this.selectText = window.getSelection().toString();
      if (this.selectText) {
        this.left = this.mouseEvent.pageX;
        // TODO: Cannot read its width via `document.getElementById('crx-comment-card').offsetWidth`
        const cardWidth = 400;
        if (this.left + cardWidth > document.body.clientWidth) {
          this.left = document.body.clientWidth - cardWidth;
        }
        this.top = this.mouseEvent.pageY;
        this.showAnnotationCard = true;
      }
    },
    changeHighlightColor(color) {
      this.highlightColor = color;
    },
  },
};
</script>

<style scoped lang="scss">
$zIndex: 9999;

#crx-comment-card {
  position: absolute;
  z-index: $zIndex;

  .card-header {
    padding: 5px;
    color: white;
  }

  &.card {
    width: 400px;
    box-shadow: 18px 25px 16px 0 rgba(0, 0, 0, 0.49);
  }
}
</style>
