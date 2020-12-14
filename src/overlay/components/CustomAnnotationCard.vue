<template>
  <div class="custom-note-box">
    <div class="card custom-note-body">
      <div class="card-body">
        <form>
          <div class="form-group">
            <input type="email" class="form-control" v-model="selectText" placeholder="Why you add this note?" />
          </div>
          <div class="form-group">
            <textarea class="form-control" rows="5" v-model="myComment" placeholder="Your Notes Here" required></textarea>
          </div>
          <span class="error-msg" v-if="errorMsg"> {{ errorMsg }}</span>
          <button type="submit" class="btn btn-primary float-right" @click.prevent="submitCustomNote">Add</button>
          <button type="button" class="btn btn-warning float-right" style="margin-right: 10px;" @click="cleanupCustomNote">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { submitPageAnnotation } from '../../utils/page-annotation';

export default {
  name: 'CustomAnnotationCard',
  data() {
    return {
      selectText: '',
      myComment: '',
      errorMsg: '',
    };
  },
  methods: {
    submitCustomNote() {
      const pageAnnotation = {
        text: this.selectText,
        note: this.myComment,
        isCustom: true,
      };
      submitPageAnnotation(pageAnnotation)
        .then(() => {
          this.cleanupCustomNote();
        })
        .catch(err => {
          this.errorMsg = err.message;
        });
      console.log('submitCustomNote...');
    },
    cleanupCustomNote() {
      this.selectText = '';
      this.myComment = '';
      this.$emit('hide:CustomAnnotationCard');
    },
  },
};
</script>

<style scoped lang="scss">
$zIndex: 9999;

.custom-note-box {
  height: 100%;
  position: absolute;
  z-index: $zIndex + 10;
  background-color: rgba(172, 177, 175, 0.39);
  width: 400px;
  right: 0;

  div.custom-note-body.card {
    width: 100% !important;
    position: absolute;
    padding-bottom: 40px;
  }
}
</style>
