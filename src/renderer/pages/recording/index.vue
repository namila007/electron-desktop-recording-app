<template>
  <div>
    <v-btn text large color="primary" @click="stopCapture">
      <v-icon>videocam</v-icon>
      Stop Recording
    </v-btn>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import recorder from '../../../main/services/recorder.js'
import { remote } from 'electron'

export default {
  layout: 'main',
  data() {
      return{};
  },  
  components: { },
  methods: {
    stopCapture () {
      ipcRenderer.send('stop::record');
    }
  }
}
</script>

<style>

</style>
