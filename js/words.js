req = $.Deferred()
$.ajax('resources/words').then(function(text){
  var words = text.split('\n');

  words.sort(function(a, b){
    return a.length - b.length;
  });

  req.resolve(words);
});

$(function(){
  $words = document.querySelector('.words')
  $code = document.querySelector('.code')

  function create(hash){
    hash = hash || uuid()
    $code.innerHTML = hash

    req.then(function(words){
      hash = hash.replace(/-/g, '')

      var id = BigNumber(hash, 16)

      var bin = id.toString(2)

      while (bin.length < 128)
        bin = '0' + bin
      
      // Get rid of the extra two bits that are not used
      var chunk = bin.substr(64, 4)
      chunk = parseInt(chunk, 2) - 8
      bin = bin.substr(0, 64) + chunk.toString(2) + bin.substr(68)

      // Get rid of the version number
      bin = bin.substr(0, 48) + bin.substr(52)

      var list = [];
      console.log(words.length);
      for(var i=0; i < 8; i++){
        var bit = bin.substr(i * 16, 16)

        var val = parseInt(bit, 2)
        list.unshift(words[val].toLowerCase())
      }

      var wordStr = ''
      for(var i=0; i < list.length; i++)
        wordStr += '<span>' + list[i] + '</span>-'
      wordStr = wordStr.substr(0, wordStr.length - 1)

      $words.innerHTML = wordStr

    });
  }

  if (/\/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.location.path)){
    create(document.location.path.toString().substr(1))
  } else {
    create()
  }
});

function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
