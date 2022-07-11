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
    <el-button type="primary" @click="test">test</el-button>
    <div id="content">
      <img :src="imgUrl" alt="">
    </div>
  </div>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {desktopService} from "@/ts/desktop"
import {ScreenBase64, Response, DesktopScreen} from "../../../../common/data";
import {createCanvas, loadImage} from "canvas";
import {Buffer} from "buffer"
import {clientSocketService} from "@/ts/socket/client";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      roomId: "",
      imgUrl: "",
      timer: 0,
    }
  },
  // sockets: {
  //   connect: function (data: any) {
  //     console.log('connect', data)
  //   },
  //   disconnect: function (data: any) {
  //     console.log('disconnect', data)
  //   },
  //   reconnect: function (data: any) {
  //     console.log('reconnect', data)
  //   },
  // },
  mounted() {

  },
  methods: {
    test() {
      clientSocketService.joinRoom(this.$data.roomId, () => {
        const canvas = createCanvas(1800, 1000)
        const ctx = canvas.getContext('2d')
        clientSocketService.screen((aResponse: Response<DesktopScreen>) => {
          console.log("Screen aResponse:", aResponse)
          const screen = aResponse.data!.screen!
          let imgBufferBase64 = Buffer.from(screen.imgBuffer).toString("base64")
          let url = `data:image/${screen!.extension!!};base64,${imgBufferBase64}`
          loadImage(url).then((image) => {
            ctx.drawImage(image, 50, 0, 1000, 800)
            this.$data.imgUrl = canvas.toDataURL()
          })
        })
      })
    },
    desktopInit() {
      desktopService.desktopInit()
    },
    desktopSuspend() {
      clearInterval(this.timer)
      desktopService.desktopSuspend()
    },
    desktopContinued() {
      desktopService.desktopContinued()
      this.pullDesktop()
    },
    applyJoinRoom() {
      desktopService.applyJoinRoom(this.$data.roomId, () => {
        this.pullDesktop()
      })
    },
    pullDesktop() {
      const canvas = createCanvas(1800, 1000)
      const ctx = canvas.getContext('2d')
      this.timer = Number(setInterval(() => {
        desktopService.pullDesktop(this.$data.roomId, (promise: Promise<Response<ScreenBase64>>) => {
          promise.then(aResponse => {
            console.log("Screen aResponse:", aResponse)
            if (aResponse.data==null) return
            let url = `data:image/${aResponse.data.extension};base64,${aResponse.data.imgBufferBase64}`
            loadImage(url).then((image) => {
              ctx.drawImage(image, 50, 0, 1000, 800)
              this.$data.imgUrl = canvas.toDataURL()
            })
            // this.$data.imgUrl = "data:image/jpg;base64," + aResponse.data?.imgBufferBase64
          }).catch(aResponse => {
            // 失败的处理函数
            console.log(aResponse)
          })
        })
      }, 1000))
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
