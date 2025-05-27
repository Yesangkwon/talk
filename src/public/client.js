// alert('client.js loaded...')
// 브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
// 즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
})()