<template>
  <div class="main" style="justify-content:center">
    <el-row>
      <el-col :span="8">
        <el-input v-model="roomId"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="2">
        <el-button type="primary" @click="applyJoinRoom">加入房间</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="desktopInit">开始</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="desktopSuspend">暂停</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="desktopContinued">恢复</el-button>
      </el-col>
    </el-row>
    <div id="content">
      <!--      <img :src="'data:image/png;base64,'+imgUrl" alt=""></div>-->
      <img :src="imgUrl" alt=""></div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {desktopService} from "@/ts/desktop"
import {Screen} from "../../../../common/data";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      roomId: "",
      imgUrl: ""
    }
  },
  // sockets: {
  //   connect() {
  //     console.log('socket connected')
  //     this.$socket.subscribe("kebab-case", function(data) {
  //       console.log("This event was fired by eg. sio.emit('kebab-case')", data)
  //     })
  //   },
  //   customEmit(data) {
  //     console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
  //   }
  // },
  methods: {
    desktopInit() {
      desktopService.desktopInit()
    },
    desktopSuspend() {
      desktopService.desktopSuspend()
    },
    desktopContinued() {
      desktopService.desktopContinued()
    },
    applyJoinRoom() {
      desktopService.applyJoinRoom(this.$data.roomId, () => {
        setInterval(() => {
          desktopService.pullDesktop(this.$data.roomId, (screen: Screen | undefined) => {
            if (screen == undefined) return
            this.$data.imgUrl = "data:image/" + screen.extension + ";" + screen.imgBuffer
          })
        }, 1000)
      })
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
