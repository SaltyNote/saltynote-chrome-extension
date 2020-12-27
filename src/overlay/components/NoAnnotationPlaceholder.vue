<template>
  <div class="card">
    <img class="card-img-top" :src="image" alt="Card image cap" />
    <div class="card-body text-center">
      <h5 class="card-title">You do not have any notes for this page! ;-)</h5>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoAnnotationPlaceholder',
  data() {
    return {
      image: chrome.runtime.getURL('icons/dog.jpg'),
    };
  },
};
</script>

<style scoped></style>
