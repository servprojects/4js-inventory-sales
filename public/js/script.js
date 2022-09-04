window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("navbar").style.padding = "13px 10px";
    document.getElementById("logo").style.fontSize = "20px";
  } else {
    document.getElementById("navbar").style.padding = "11px 10px";
    document.getElementById("logo").style.fontSize = "30px";
  }
}

$(document).ready(function() {
  $('#items').DataTable();
} );

$('.modalbutton').modal({
  backdrop: 'static',
  keyboard: false
})

$(function(){
	$("#test").click(function(){
		$(".test").modal('show');
	});
	$(".test").modal({
		closable: true
	});
});

$('[data-dismiss=modal]').on('click', function (e) {
  var $t = $(this),
      target = $t[0].href || $t.data("target") || $t.parents('.modal') || [];

$(target)
  .find("input,textarea,select")
     .val('')
     .end()
  .find("input[type=checkbox], input[type=radio]")
     .prop("checked", "")
     .end();
})

$('.close').on('click', function (e) {
  var $t = $(this),
      target = $t[0].href || $t.data("target") || $t.parents('.modal') || [];

$(target)
  .find("input,textarea,select")
     .val('')
     .end()
  .find("input[type=checkbox], input[type=radio]")
     .prop("checked", "")
     .end();
})


$('.ui.dropdown')
  .dropdown()
;

$('#search-select')
  .dropdown()
;

$(function () {
  $('[data-toggle="popover"]').popover()
});

$('[data-toggle="popover"]').tooltip({
  container: '#fullscreen_viewer'
});


$( function(){
  $('#endses').modal();
} )

