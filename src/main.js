const Koa = require('koa') //1
// const app = new Koa(); //2
const path = require('path') //3
const serve = require('koa-static')//6
//15번처럼 js파일에 html 태그를 작성하는 것은 너무 비효율적이다.
//그래서 우리는 xxx.html문서 단위로 랜더링 처리를 요청할 수 있는
//send라는 함수를 koa-send 라이브러리로 부터 제공받는다.
const send = require('koa-send') //7
const mount = require('koa-mount') //8
const websockify = require('koa-websocket') //9
const app = websockify(new Koa()) //10

//정적 리소스에 대한 파일 경로 설정하기
const staticPath = path.join(__dirname, './views') //4

app.use(serve(staticPath)); //5

//9 - public의 경로와 views의 경로에 같은 파일이 있으면 구별이 안된다.
app.use(mount('/public', serve('src/public')))

//기본 라우터 설정하기
app.use(async(ctx) => {
  if(ctx.path === '/'){
    ctx.type = 'text/html'
    //index.html문서가 하는 일을 여기에 작성해 본다.
    ctx.body =`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>welcome</title>
      </head>
      <body>
        <h1>Welcome to koa server</h1>
      </body>
      </html>
    `
  } // http://localhost:5000/
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
});

app.listen(5000);