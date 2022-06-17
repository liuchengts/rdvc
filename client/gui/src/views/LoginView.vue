<template>
  <div class="main">
    <el-row>
      <el-col :span="16">
        <el-input v-model="input"></el-input>
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="sendMsg">Send</el-button>
      </el-col>
    </el-row>
    <div id="content">
      <img :src="'data:image/png;base64,'+imgUrl" alt=""></div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {Events} from "@/ts/socket/events";
import {getScreen, pushToServer} from "@/ts/socket/client";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      input: "",
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
    interval() {
      setInterval(() => {
        this.imgUrl = getScreen()
      }, 1000 * 5)
    },
    sendMsg() {
      // this.$emit(Events.CONNECT, this.input)
      pushToServer(Events.INIT, this.input)
      this.interval()
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
