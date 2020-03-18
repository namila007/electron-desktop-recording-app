<template >
<div class="transparent-view"></div>
</template>
<script>
import { remote } from 'electron'
export default {
  layout: 'blank',
  methods: {
    openURL (url) {
      remote.shell.openExternal(url)
    },
    openPathSet () {

    }
  },
}
</script>

<style>

.transparent-view {
  width: 100vw;
  height: 100vh;
  border: 2px dashed red; }
</style>
