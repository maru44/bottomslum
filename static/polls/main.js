const getCookie = name =>{
  if (document.cookie && document.cookie !== '') {
      for (const cookie of document.cookie.split('; ')){
          const [key, value] = cookie.trim().split('=');
          if(key === name) {
              return decodeURIComponent(value);
          }
      }
  }
};

const genCsrf = () => {
  var len = 64;
  var chara = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charalen = chara.length;
  var toke = "";
  for (var i=0; i< len; i++) {
    toke += chara[Math.floor(Math.random()*charalen)];
  }
  return toke;
}

const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
document.cookie = 'timezone=' + encodeURIComponent(timeZoneName) + '; path=/';
document.cookie = "access=" + encodeURIComponent("") + "; path=/; max-age=60";
document.cookie = `csrftoken=${genCsrf()}; path=/`;

const csrftoken = getCookie('csrftoken');
const timezone = getCookie('timezone');
const access = getCookie('access');

const setOgp = (targ, aft) => {
  var headData = document.head.children;
  console.log(headData);
  for (var i = 0; i < headData.length; i ++) {
    var propertyVal = headData[i].getAttribute('property');
    if (propertyVal !== null) {
      if (propertyVal.indexOf(`og:${targ}`) != -1) {
        return headData[i].setAttribute('content', aft);
      }
    }
  }
}


$(function() {
  const modo = document.getElementsByClassName("modoruB");
  $(modo).click(function() {
    window.history.back();
  });
  const susu = document.getElementsByClassName("susumuB");
  $(susu).click(function() {
    window.history.forward();
  });
  const topo = document.getElementsByClassName("toTop");
  $(topo).click(function() {
    scrollTo(0, 0);
  });
  const posB = document.getElementsByClassName("postBtn");
  const modal = document.getElementsByClassName("modal");
  const modalCon = document.getElementsByClassName("modal-con");
  //  + 押すとmodal展開
  $(posB).click(function() {
    $(modal).removeClass('off');
    $(modalCon).removeClass('off');
  });
  //返信する  を押すとmodal展開
  $(document).on('click', '.repB', function() {
    $(modal).removeClass('off');
    $(modalCon).removeClass('off');
  });
  $(document).on('click', '.modal', function() {
    $(modal).addClass('off');
    $(modalCon).addClass('off');
  })
})
