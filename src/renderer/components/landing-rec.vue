<<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="8" md="1">
          <v-text-field
            v-model="savepath"
            label="Select Saving Path"
            disabled
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <div class="my-2">
            <v-btn text large color="Blue" @click="selectPath"
              >Choose Path</v-btn
            >
          </div>
        </v-col>
      </v-row>
      <v-row>
        <div class="my-2">
          <v-btn text large color="primary" @click="startCapture" v-show="sbutton">
            <v-icon>videocam</v-icon>
            Start Recording
          </v-btn>
           <v-btn text large color="primary" @click="stopCapture" v-show="!sbutton">
            <v-icon>videocam</v-icon>
            Stop Recording
          </v-btn>
          
        </div>
      </v-row>
    </v-container>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import recoder from '../../main/services/recorder.js'
let recorderInst;
export default {
  data() {
    return {
      savepath: "",
      sbutton: true,
      error: null
    };
  },
  methods: {
    selectPath() {
      ipcRenderer.send("pick::path");
    },
    startCapture() {
     
     this.sbutton=false;
     this.recorderInst = new recoder(this.path);
     this.recorderInst.startRecord();
      ipcRenderer.send("start::record",this.savepath);
    },
    stopCapture() {
     this.sbutton=true;
      ipcRenderer.send('stop::record');
     this.recorderInst.stopRecord(false);
    }
  },
  async mounted() {
    ipcRenderer.on("path::chosen", (e, path) => {
      console.log(path);
      this.savepath = path;
      
    });
  }
};
</script>

<style scoped></style>
