import $ from 'jquery';
import './style.css';

$(document).ready(() => {
  const $input = $('#log');
  $('#submit').click(() => {
    console.log($input.val());
  });

  $('#ajax').click(() => {
    $.ajax('/snippet/ajax.json');
  });
});
