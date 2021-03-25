var elem = document.querySelector('input[type="range"]');

var rangeValue = function(){
  var newValue = elem.value;
  var price0 = Number($(this).attr("data-price0"));
    var price = newValue*price0;
  var target = document.querySelector('.value');
  var target1 = document.querySelector('.value1');
  target.innerHTML = newValue+" hours";
  target1.innerHTML = "$"+price;
  $(".rentNowBtn").attr("data-value0",newValue);
}

elem.addEventListener("input", rangeValue);