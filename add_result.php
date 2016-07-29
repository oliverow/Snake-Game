<?php
 $name = $_REQUEST['name'];
 $score = $_REQUEST['score'];

 $fp = fopen('highscores.txt', 'a');
 fwrite($fp, $name.",".$score."\n");
 fclose($fp);
?>