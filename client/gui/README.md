```shell
apt update -y
apt install nodejs npm -y
############################## 手动安装nodejs
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs
npm install -g cnpm --registry=https://registry.npm.taobao.org
############################## nvm
su gitlab-runner
mkdir /home/gitlab-runner/nvm
echo "" >  /home/gitlab-runner/.bashrc
export NVM_DIR="/home/gitlab-runner/nvm"
# 下载不下来就用 wget https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh 再用 bash install.sh 执行
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source /home/gitlab-runner/.bashrc
```
```vue
npm install -g typescript
npm install --global @vue/cli@next
npm install element-plus --save
npm install vue3-cookies --save
npm install axios --save
npm install @element-plus/icons-vue
npm install --save ts-md5
npm install vue-3-socket.io --save
npm install buffer --save
"vue-3-socket.io":"^1.0.5",
vue ui

cd khl-web
npm run serve
npm run build




npm install -g node-gyp

```