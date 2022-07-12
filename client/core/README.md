npm install -g express
npm install typescript @types/express @types/node -D
npm install ts-node nodemon -D
npm install -g socket.io
npm install -g express-handlebars

[comment]: <> (npm i -g @squoosh/lib)

https://blog.csdn.net/chenshanqiang/article/details/103137313
https://github.com/ericf/express-handlebars
https://juejin.cn/post/6921870622565875726

lsof -i:8000

npm install -g express screenshot-desktop socket.io-client @squoosh/lib

更改文件
cp ./build/client/core/src/desktop/index.js  node_modules/screenshot-desktop/lib/win32/index.js


```
"targets": [
"node16-macos-x64",
"node16-win-x64",
"node12-linux"
],
```


```js
结算 >>>> quality: 10  平均耗时 ms: 1189.48  buffer长度: 62.1396484375 kb
结算 >>>> quality: 20  平均耗时 ms: 1201.16  buffer长度: 97.7294921875 kb
结算 >>>> quality: 30  平均耗时 ms: 1389.94  buffer长度: 122.353515625 kb
结算 >>>> quality: 40  平均耗时 ms: 1360.13  buffer长度: 147.0166015625 kb
结算 >>>> quality: 50  平均耗时 ms: 1393.16  buffer长度: 169.2646484375 kb
结算 >>>> quality: 60  平均耗时 ms: 1451.79  buffer长度: 193.9453125 kb
结算 >>>> quality: 70  平均耗时 ms: 1512.31  buffer长度: 227.6171875 kb
结算 >>>> quality: 80  平均耗时 ms: 1893.59  buffer长度: 301.37890625 kb
结算 >>>> quality: 90  平均耗时 ms: 2866.18  buffer长度: 480.5 kb

```