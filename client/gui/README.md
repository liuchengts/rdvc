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
### 推流服务器 nginx-rtmp
```shell
http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;
    server {
        listen       81;
        server_name  localhost;
        location /hls { #这里也是需要添加的字段。
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            alias "/home/lc/Videos/hls/"; #视频流文件目录,跟上面的hls_path保持一致
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
        }
    }
}
rtmp {
   server {
      listen 1935; #监听端口,若被占用,可以更改
      chunk_size 4000; #上传flv文件块儿的大小

      application hls{
            live on;
            hls on;
            hls_path "/home/lc/Videos/hls/"; #视频流文件目录
            hls_fragment 1s; #没有生效
            hls_playlist_length 30s;
            hls_nested on; #默认是off。打开后的作用是每条流自己有一个文件夹
            hls_cleanup off; #不清理ts
       }
    }
}

sudo ffmpeg -re -stream_loop -1 -i test.mp4 -vcodec copy -acodec copy -f flv rtmp://10.30.70.14:1935/hls/home
```