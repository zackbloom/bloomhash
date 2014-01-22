var req = $.Deferred();
$.ajax('resources/words.txt').then(function(text){
  var words = text.split('\n');

  words.sort(function(a, b){
    return a.length - b.length;
  });

  req.resolve(words);
});

$(function(){
  var $words = document.querySelector('.words');
  var $code = document.querySelector('.code');
  var $permalink = document.querySelector('.permalink');
  var $random = document.querySelector('.random');

  $words.innerHTML = 'Loading...';

  function create($code, $words, $permalink, hash){
    hash = hash || uuid();
    $code.innerHTML = hash;

    req.then(function(words){
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
      for(var i = 0; i < 8; i++){
        var bit = bin.substr(i * 16, 16);

        var val = parseInt(bit, 2);
        list.unshift(words[val].toLowerCase().trim());
      }

      var wordStr = '';
      for(var i = 0; i < list.length; i++){
        wordStr += '<span>' + list[i] + '</span>-';
      }
      wordStr = wordStr.substr(0, wordStr.length - 1);

      $words.innerHTML = wordStr;

      $permalink.href = '/' + hash;
    });
  }

  if (/^\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.location.pathname)){
    create($code, $words, $permalink, document.location.pathname.toString().substr(1));
  } else {
    create($code, $words, $permalink);
  }

  $random.addEventListener('click', function(e){
    e.preventDefault();

    history.replaceState({}, '', '/');

    create();
  });

  var $hashTable = document.querySelector('.hash-table');
  var j = 1000;
  var createTableRow = function(){

    var $code = document.createElement('td');
    var $words = document.createElement('td');
    var $permalinkContainer = document.createElement('td');
    var $permalink = document.createElement('a');
    var $row = document.createElement('tr');

    $permalink.innerText = 'Permalink';
    $permalinkContainer.appendChild($permalink);
    $row.appendChild($code);
    $row.appendChild($words);
    $row.appendChild($permalinkContainer);
    $hashTable.appendChild($row);

    create($code, $words, $permalink);

    j *= 0.95;
    if (j > 1){
      setTimeout(createTableRow, j);
    }
  };

  var interval = setTimeout(createTableRow, j);
});

function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
