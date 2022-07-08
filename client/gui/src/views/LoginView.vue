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
      <img :src="imgUrl" alt="" style="width: 200px;height: 200px">
    </div>
  </div>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {desktopService} from "@/ts/desktop"
import {ScreenBase64, Response} from "../../../../common/data";
import {createCanvas, loadImage} from "canvas";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      roomId: "",
      listImg: ["images/1.jpg", "images/2.jpg", "images/3.jpg"],
      imgUrl: "",
      variableImgUrl: "",
      timer: 0
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
    test() {
      const canvas = createCanvas(200, 200)
      const ctx = canvas.getContext('2d')
      // // Write "Awesome!"
      // ctx.font = '30px Impact'
      // ctx.rotate(0.1)
      // ctx.fillText('Awesome!', 50, 100)
      //
      // // Draw line under text
      // let text = ctx.measureText('Awesome!')
      // ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      // ctx.beginPath()
      // ctx.lineTo(50, 102)
      // ctx.lineTo(50 + text.width, 102)
      // ctx.stroke()
      for (let i in this.listImg) {
        let url = this.listImg[i]
        console.log("url:", url)
        loadImage(url).then((image) => {
          ctx.drawImage(image, 50, 0, 70, 70)
          this.$data.imgUrl = canvas.toDataURL()
        })
      }
      let index=0
      setInterval(() => {
        if (index==3){
          index=0
        }else {
          index=index+1
        }

        loadImage(this.variableImgUrl).then((image) => {
          ctx.drawImage(image, 50, 0, 70, 70)
          this.$data.imgUrl = canvas.toDataURL()
        })
      }, 100)
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
      // this.timer = Number(setInterval(() => {
      //   desktopService.pullDesktop(this.$data.roomId, (promise: Promise<Response<ScreenBase64>>) => {
      //     promise.then(aResponse => {
      //       console.log("Screen aResponse:", aResponse)
      //       this.$data.imgUrl = "data:image/jpg;base64," + aResponse.data?.imgBufferBase64
      //     }).catch(aResponse => {
      //       // 失败的处理函数
      //       console.log(aResponse)
      //     })
      //   })
      // }, 1000))
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
