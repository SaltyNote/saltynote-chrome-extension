<template>
  <div class="saltynote-global-search">
    <div class="container">
      <div class="jumbotron">
        <button type="button" class="close search-close" aria-label="Close" @click="closePopover">
          <span>&times;</span>
        </button>
        <div class="form-group has-search">
          <fa-icon icon="search" class="form-control-feedback" />
          <input type="text" class="form-control" placeholder="Search" v-model="keyword" @change="search" ref="searchInput" />
        </div>

        <div class="my-3 p-3 bg-white rounded shadow-sm">
          <template v-if="notes.length > 0">
            <h6 class="border-bottom border-gray pb-2 mb-0">Search Result(s):</h6>
            <div class="media text-muted pt-3" v-for="note in notes" :key="note.id">
              <img :src="'https://s2.googleusercontent.com/s2/favicons?sz=64&domain=' + getHost(note.url)" style="border-style: none; width: 32px; height: 32px;" alt="" />
              <div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray" style="padding-left: 10px">
                <div class="d-flex justify-content-between align-items-center w-100">
                  <strong class="text-gray-dark" :style="{ backgroundColor: note.highlightColor }">{{ note.text }}</strong>
                  <a :href="note.url" target="_blank" style="min-width: 90px">Open in new tab</a>
                </div>
                <span class="d-block" v-html="markdown(note.note)"></span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="card">
              <img class="card-img-top search-dog-img" :src="image" alt="Card image cap" />
              <div class="card-body text-center">
                <h5 class="card-title">I have eaten your results! ;-)</h5>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { searchPageAnnotations } from '../../utils/page-annotation';
import toastr from 'toastr';
import { getUrlHost } from '../../utils/urls';
import { mdRender } from '../../utils/md';
import { EventBus } from '../../utils/event-bus';
import { CLOSE_SEARCH } from '../../utils/action-types';

export default {
  name: 'Search',
  data() {
    return {
      keyword: '',
      notes: [],
      image: chrome.runtime.getURL('icons/dog.jpg'),
    };
  },
  created() {
    toastr.options.progressBar = true;
  },
  mounted() {
    this.$refs.searchInput.focus();
  },
  methods: {
    search() {
      if (!this.keyword || !this.keyword.trim()) {
        toastr.error('Keyword cannot be empty!');
        return;
      }
      searchPageAnnotations(this.keyword).then(notes => {
        this.notes = notes;
      });
    },
    getHost(url) {
      return getUrlHost(url);
    },
    markdown(val) {
      return mdRender(val);
    },
    closePopover() {
      this.$refs.searchInput.value = '';
      EventBus.$emit(CLOSE_SEARCH);
    },
  },
};
</script>

<style lang="scss" scoped>
.saltynote-global-search {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: #80808082;
  z-index: 9;
  padding-top: 2rem;
}

.container .jumbotron {
  max-height: 95vh;
  overflow-y: scroll;
  padding-top: 2rem;
  .search-close {
    position: relative;
    top: 0;
    right: 0;
  }
}

.has-search .form-control {
  padding-left: 2.375rem;
}

.has-search .form-control-feedback {
  position: relative;
  top: 2rem;
  z-index: 2;
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  line-height: 2.375rem;
  text-align: center;
  pointer-events: none;
  color: #aaa;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}

.card-img-top.search-dog-img {
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}
</style>
