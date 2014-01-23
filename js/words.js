var req = $.Deferred();
$.ajax('resources/words.txt').then(function(text){
  var words = text.split('\n');

  // Newline at the end of the file
  words.pop();

  words.sort(function(a, b){
    return a.length - b.length;
  });

  req.resolve(words);
});

$(function(){
  var $words = $('.words');
  var $code = document.querySelector('.code');
  var $permalink = document.querySelector('.permalink');
  var $random = document.querySelector('.random');

  function create(hash){
    hash = hash || uuid();
    $code.innerHTML = hash;

    req.then(function(words){
      var i;

      var _hash = hash.replace(/-/g, '');

      var id = BigNumber(_hash, 16);

      var bin = id.toString(2);

      while (bin.length < 128){
        bin = '0' + bin;
      }

      // Get rid of the extra two bits that are not used
      var chunk = bin.substr(64, 4);
      chunk = parseInt(chunk, 2) - 8;
      bin = bin.substr(0, 64) + chunk.toString(2) + bin.substr(68);

      // Get rid of the version number
      bin = bin.substr(0, 48) + bin.substr(52);

      var list = [];
      for(i = 0; i < 8; i++){
        // The last (which ends up as first) only gets 10 bits, which means the
        // first word is going to be one of the 1024 shortest.
        var bit = bin.substr(i * 16, 16);

        var val = parseInt(bit, 2);
        list.unshift(words[val].toLowerCase().trim());
      }

      var wordStr = '';
      for (i = 0; i < list.length; i++) {
        wordStr += '<span>' + list[i] + '</span>-';
      }
      wordStr = wordStr.substr(0, wordStr.length - 1);

      $words.html(wordStr);
      fitWords();

      $('.loading').addClass('done');

      $permalink.href = '/' + hash;
    });
  }

  function fitWords() {
    var $words = $('.words');
    $words.addClass('adjusting-size');

    var fontSize = 8;
    var windowWidth = $(window).width();

    while (fontSize < 40) {
      $words.css('font-size', fontSize);
      if ($words.outerWidth() > windowWidth - 100) {
        break;
      } else {
        fontSize++;
      }
    }

    var resizeTimeout;
    $(window).resize(function(){
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function(){
        fitWords();
      }, 800);
    });

    $words.removeClass('adjusting-size');
  }

  if (/^\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.location.pathname)){
    create(document.location.pathname.toString().substr(1));
  } else {
    create();
  }

  $random.addEventListener('click', function(e){
    e.preventDefault();

    history.replaceState({}, '', '/');

    create();
  });
});

function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
