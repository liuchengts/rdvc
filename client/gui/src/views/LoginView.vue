<template>
  <div class="main" style="justify-content:center">
    <el-row>
      <el-col :span="8">
        <el-input v-model="roomId"></el-input>
      </el-col>
    </el-row>
    <!--    <el-row>-->
    <!--      <el-col :span="2">-->
    <!--        <el-button type="primary" @click="applyJoinRoom">加入房间</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="2">-->
    <!--        <el-button type="primary" @click="desktopInit">开始</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="2">-->
    <!--        <el-button type="primary" @click="desktopSuspend">暂停</el-button>-->
    <!--      </el-col>-->
    <!--      <el-col :span="2">-->
    <!--        <el-button type="primary" @click="desktopContinued">恢复</el-button>-->
    <!--      </el-col>-->
    <!--    </el-row>-->
    <p>=========================localVideo===================================</p>
    <video id="localVideo" autoplay playsinline controls="false"></video>
    <p>=========================acceptVideo==================================</p>
    <!--        <video id="acceptVideo" autoplay playsinline muted></video>-->
    <video id="acceptVideo" autoplay playsinline controls="false"></video>
    <el-button type="primary" @click="push">开始推流</el-button>
    <div id="content">
      <img :src="imgUrl" alt="">
    </div>
  </div>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {init, pushClient} from "@/ts/DisplayMedia2";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      roomId: "",
      imgUrl: "",
      timer: 0,
    }
  },
  mounted() {
    init()
  },
  methods: {
    push() {
      const constraints = {
        'video': true,
        'audio': true
      }
      // navigator.mediaDevices.getUserMedia(constraints)
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(stream => {
          pushClient(stream)
        })
        .catch(error => {
          console.error('Error accessing media devices.', error);
        });

    },
    accept() {
      const constraints = {
        'video': true,
        'audio': true
      }
      // navigator.mediaDevices.getUserMedia(constraints)
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(stream => {
          let videoElement = document.querySelector("#localVideo") as HTMLMediaElement;
          videoElement!!.srcObject = stream;
          pushClient(stream)
          // acceptClient(document.querySelector("#acceptVideo")  as HTMLMediaElement)
        })
        .catch(error => {
          console.error('Error accessing media devices.', error);
        });

    }
  }
})

</script>

<style>
.el-row {
  margin-bottom: 10px;
}

.login_form {
  /*max-width: 460px;*/
}

.login_btn {
  width: 100%;
  min-height: 110%;
}

.ht_btn {
  min-width: 45%;
  max-width: 45%;
  min-height: 110%;
  max-height: 110%;
}

</style>
