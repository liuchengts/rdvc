<!--header 头部-->
<template>
  <div class="header">
    <el-header style="text-align: right; font-size: 12px">
      <div class="toolbar">
        <h2>管理平台</h2>
        <el-dropdown>
          <el-icon style="margin-right: 8px; margin-top: 1px">
            <setting/>
          </el-icon>
          <span>设置</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="out">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
  </div>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {loginService} from "@/ts/logIn";
import {AResponse} from "@/ts/common/data";
import {AUTH} from "@/ts/common/auth"
import {VIEWS} from "@/ts/common/views";

export default defineComponent({
  name: "headerComponent",
  data() {
    return {}
  },
  methods: {
    out() {
      // 先调用 nextCallback 设置函数
      // 使用 loginService 的默认实现 来处理 Callback ，这里我只传递了成功的 Callback ，
      // 并且自动转义 promise<T> 对应的返回数据模型
      loginService.nextCallback((aResponse: AResponse<void>) => {
        // 成功的处理函数
        AUTH.removeXtoken()
        loginService.to(VIEWS.LoginView)
      })
      // 调用退出登录接口
      loginService.out()
    }

  }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.header {
  .el-header {
    background-color: #545454;

    .toolbar {
      height: inherit;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      h2 {
        color: white;
      }

      .el-dropdown {
        color: #ffffff;
        cursor: pointer;
      }
    }

  }


}

</style>
