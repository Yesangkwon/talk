//문제제기
//네트워크 문제, 서버 의도적인 종료, 클라이언트 의도적인 종료, 프록시, 방화벽
//인증실패(400, 401, 403)
//운영기준, 연결 종료
//끊김 감지는 하는 코드 작성
//자동으로 재연결
//안정적으로 서비스 지원 코드를 작성하기
//함수활용 능력
;(()=>{
  let socket = null; // WebSocket
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_INTERVAL = 3000
  //소켓이 끊긴 경우 새로운 소켓객체를 생성하기
  const reconnectWebSocket = () => {
    if(reconnectAttempts >= MAX_RECONNECT_ATTEMPTS){
      console.log('최대 재연결 시도 횟수를 초과했습니다.');
      alert('서버와의 연결이 불안정합니다. 페이지를 새로고침 해 보세요.')
      return
    }
    console.log('재연결 하고 있씁니다. 잠시만 기다려 주세요....');
    reconnectAttempts++
    try {
      socket = new WebSocket(`ws://${ window.location.host }/ws`)
    }catch(error){
      console.error('웹 소켓 재 연결 실패', error);
      //setInterval과 다른 점은 3초 후에 딱 한번만 호출함.
      //내 안에서 나를 다시 호출하기 - 재귀
      setTimeout(reconnectWebSocket, RECONNECT_INTERVAL)
    }
  }//end of reconnectWebSocket

  const setupWebSocketHandlers = () => {
    console.log('setupWebSocketHandlers');
    socket.onopen = () => {
      console.log('WebSocket 연결됨');
      //연결이 되면 재시도 변수는 초기화
      reconnectAttempts = 0;
    }
    socket.onclose = () => {
      console.log('WebSocket 연결종료됨');
      settimeout(reconnectWebSocket, RECONNECT_INTERVAL)
    }
    //함수에서 파라미터 자리
    //특히 콜백함수에서 외부에서 주입해주는 객체 또는 값
    socket.onerror = () => {
      console.log('WebSocket 에러 발생');
    }
    //만일 여기까지 문제 없이 진행되었다면 메세지 처리
    //onmessage이벤트 핸들러는 웹소켓이 제공하는 이벤트 핸들러 이다.
    socket.addEventListener('message', handleMessage)
  }//end of setupWebSocketHandlers
  //{type:'talk|sync', payload:{nickname, message, curtime}}
  const handleMessage = (event) => {
    console.log('handleMessage');
    const {type, payload} = JSON.parse(event.data)
    //너 이전 대화 내용 원해
    if('sync' === type){
      console.log('sync');
      //insert here - 서버에서 청취한 object를 chats배열에 push한다.
      const { talks: syncedChats } = payload
      Object.keys(syncedChats).map(key => {
        chats.push(syncedChats[key].payload)
      })
    }else if('talk' === type){
      console.log('talk');
      //insert here - 서버에서 청취한 object를 chats배열에 push한다.
      const talk = payload
      chats.push(talk)
    }
    //화면에 반영하기
    //if문이나 else if문 안에 적지 않습니다. - 위치
    //공통이니까 - 이전 대화 내용도 렌더링 대상이고 새 대화내용도 렌더링 해야되니까...
    drawChats()
  }//end of handleMessage

  //닉네임 입력받기
  let myNickName = prompt('닉네임을 입력하세요', 'default')
  //채팅화면 타이틀 변경
  const title = document.querySelector('#title')
  if(myNickName !=null){
    title.innerHTML = `{{${myNickName}}} 님의 예약 상담`
  }

  socket = new WebSocket(`ws://${window.location.host}/ws`)
  setupWebSocketHandlers()
  //사용자가 입력한 메시지를 서버로 전송해 본다.
  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  const chatsEl = document.querySelector('#chats')
  if(!formEl || !inputEl || !chatsEl){
    throw new Error('formEl or inputEl or chatsEl is null')
  }
  //아래 배열은 서버에서 보내준 정보를 담는 배열이다. - 청취한 정보가 담긴다
  //청취하기는 onmessage 이벤트 핸들러 처리한다.
  const chats = [] //선언만 했다. onmessage채운다. -> push
  formEl.addEventListener('submit',(e) => {
    e.preventDefault()
    socket.send(JSON.stringify({
      nickname: myNickName,
      message: inputEl.value}))
    inputEl.value = ''
  })

  //화면과 로직은 분리한다.
  //화면에 표시할 때 마다 배열 전체를 다시 그린다.
  const drawChats = () => {
    //insert here
    chatsEl.innerHTML = '' // 현재 대화 목록을 비운다.
    //div안에 새로운 div를 만들어서 채운다.<div><div>안쪽에 입력된다.</div></div>
    chats.forEach(({nickname, message, curtime}) => {
      const div = document.createElement('div')
    div.innerText = `[${nickname}] : ${message} (${curtime})`
    // 바깥쪽 div에 안쪽 div 추가한다. - appendChild
    chatsEl.appendChild(div)
    })
    //새로운 메시지가 추가되면 자동으로 스크롤을 맨 아래로 이동하기
    chatsEl.scrollTo = chatsEl.scrollHeight
  }//end of drawChats
  //종료 버튼을 눌렀을 때 이벤트 처리는 사전에 사용자가 선 진행 후에
  //호출되는 함수 이므로 위치 문제에 대해서는 관대한 편이다.
  //단 다른 기능을 처리하는 함수 안에서 사용하는 것은 아니다.
  //이벤트 소스를 먼저 선언하기
  //exit는 <button id='exit'>
  //버튼은 사용자 누른다. - 감지는 브라우저가 한다.
  //인터셉트 할게 -> 클릭했을 때 채팅 창을 나가기 하려고
  const exit = document.querySelector('#exit')
  exit.addEventListener('click', (e) => {
    alert('채팅창이 종료됩니다.')
    window.location.href = '/'
  })//end of exit
})()