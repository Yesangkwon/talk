const Koa = require('koa') //1
//const app = new Koa();//2
const path = require('path')//3
const serve = require('koa-static')//6 - 정적리소스 경로 설정하기
//15번처럼 js파일에 html태그를 작성하는 것은 너무 비효율적이다.
//그래서 우리는 XXX.html문서 단위로 렌더링 처리를 요청할 수 있는
//send라는 함수를 koa-send라이브러리로 부터 제공받는다.
const send = require('koa-send')//7
const mount = require('koa-mount') //8
const websockify = require('koa-websocket')//9
const app = websockify(new Koa())//10
const route = require('koa-route')//11
//정적 리소스에 대한 파일 경로 설정하기
const staticPath = path.join(__dirname, './views')//4

app.use(serve(staticPath));//5

//9 - public의 경로와 views의 경로에 같은 파일이 있으면 구별이 안된다.
app.use(mount('/public', serve('src/public')))

//기본 라우터 설정하기
app.use(async(ctx) => {
  if(ctx.path === '/'){
    ctx.type = 'text/html'
    //index.html문서가 하는 일을 여기에 작성해 본다.
    ctx.body = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>welcome</title>
      </head>
      <body>
        <h1>Welcome to the koa server</h1>
      </body>
      </html>    
    `
  }
  //http://localhost:5000/talk
  else if(ctx.path === '/login'){
    await send(ctx, 'login.html', {root:staticPath})
  }
  else if(ctx.path === '/talk'){
    await send(ctx, 'talk.html', {root:staticPath})
  }
  else if(ctx.path === '/notice'){
    await send(ctx, 'notice.html', {root:staticPath})
  }
  else{
    ctx.status = 404
    ctx.body = 'Page Not Found'
  }
});//end of use

// npm i koa-route 먼저 설치한다.
// 왜나면 koa-websocket과 koa-route 서로 의존관계 있다.
// Using routes
app.ws.use(
  //ws는 websocket을 의미한다.
  //-> /test/:id로 요청이 오면 아래를 처리하라.
  route.all('/ws', async(ctx) => {
  ctx.websocket.on('message', (data) => {
    console.log(typeof data);
    if(typeof JSON.stringify(data) !== 'string'){
      return;
    }
    const { message, nickname } = JSON.parse(data)
    console.log(`${message}, ${nickname}`);
  });
}));

app.listen(5000);