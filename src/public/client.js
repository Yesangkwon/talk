//alert('client.js loaded....')
//브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
//즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  //닉네임 입력받기
  let myNickName = prompt('닉네임을 입력하세요', 'default')
  //채팅화면 타이틀 변경
  const title = document.querySelector('#title')
  if(myNickName !=null){
    title.innerHTML = `{{${myNickName}}} 님의 예약 상담`
  }

  const socket = new WebSocket(`ws://${window.location.host}/ws`)
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
  const drawChats = () => {
    //insert here
    chatsEl.innerHTML = '' // 현재 대화 목록을 비운다.
    //div안에 새로운 div를 만들어서 채운다.<div><div>안쪽에 입력된다.</div></div>
    //[키위] : 안녕하세요 (12:37:50)
    //chats는 배열이다.
    chats.forEach(({nickanem, message, curtime}) => {
      const div = document.createElement('div')
    div.innerText = `[${nickname}] : ${message} (${curtime})`
    // 바깥쪽 div에 안쪽 div 추가한다. - appendChild
    chatsEl.appendChild(div)
    })
  }//end of drawChats
  //사용자가 입력한 메시지를 서버에서 보내주면 화면 출력한다.
  //파라미터 자리는 사용자가 입력한 값을 담는 자리이다.
  //누가 넣어주나요? 아래 이벤트는 소켓 통신이 호출하는 콜백함수이다.
  //콜백함수는 개발자가 호추랗는 함수가 아니다. 그러면 누가? 시스템에서
  //이벤트가 감지 되었을 때(상태값이 변경될 때 마다)
  //서버에서 전송한 메시지를 모두 다 받았을 때 주입된다.
  //{data:{type:'', payload:{nickname:'키위', message:'메시지', curtime:''}}}
  socket.addEventListener('message', (event)=>{
    const { type, payload } = JSON.parse(event.data)
    console.log('type ==>' + type);
    console.log('payload ==>' + payload);
    console.log('nickname ==>' + payload.nickanem);
    console.log('message ==>' + payload.message);
    console.log('curtime ==>' + payload.curtime);
    //아래 조건문에서 사용하는 type은 어디서 가져오나요?
    //
    if('sync' === type){
      console.log('sync');
      //insert here - 서버에서 청취한 object를 chats배열에 push한다.
      const { talks: syncedChats } = payload
      Object.keys(syncedChats).map(key => {
        chats.push(syncedChats[key].payload)
      })
    }else if('talk' === type){
      console.log('sync');
      //insert here - 서버에서 청취한 object를 chats배열에 push한다.
      const talk = payload
      chats.push(talk)
    }
    drawChats() // sync일때나 talk일 때 공통이다.
    //반드시 조건문 밖에서 호출할것. - 위치
    //서버에서 보낸 메시지 청취하기

    chats.push(JSON.parse(event.data)) 
    chatsEl.innerHTML = ''
    chats.forEach(({nickname, message}) => { 
      const div = document.createElement('div')
      div.innerText = `${nickname}: ${message}[12:34]`
      chatsEl.appendChild(div)
    })
  })//end of event listener
})()