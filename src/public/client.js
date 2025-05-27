//alert('client.js loaded....')
//브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
//즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  formEl.addEventListener('submit', (e) => {
    //페이지가 refresh되지 않고 다음 액션을 정상적으로 처리할 수 있다.
    e.preventDefault()
    alert('전송: '+inputEl.value);
    socket.send(JSON.stringify({
      nickname: '키위',
      message: inputEl.value
    }))
    inputEl.value = ''
  })
  //서버에서 보낸 정보를 받아서 출력하기
  socket.addEventListener('message', (event)=>{
    alert(event.data)
  })
})()