(function() {
  document.onkeydown = document.onkeyup = () => {};

  var buf='<center><form name=form1><table border=0 cellspacing=3 cellpadding=3><tr>'
    +'<td><font face="Arial,Helvetica,sans-serif" size=2 point-size=10'
    +'><nobr>Level:</font>&nbsp;<select name=s1 onchange="getLevel();this.blur();">'
    +'<option value=1 selected>1'
    +'<option value=2>2'
    +'<option value=3>3'
    +'<option value=4>4'
    +'<option value=5>5'
    +'<option value=6>6'
    +'<option value=7>7'
    +'<option value=8>8'
    +'<option value=9>9'
    +'<option value=10>10'
    +'</select>'
    +'</nobr></font></td>'

    +'<td>'
    +'<font face="Arial,Helvetica,sans-serif"'
    +'size=2 point-size=10'
    +'><nobr>Lines:&nbsp;<input name=Lines type=text value="0" size=2 readonly'
    +'></nobr></font></td>'

    +'<td><input type=button value="Start" onCLick="GAME.start()"></td>'
    +'<td><input type=button value="Pause" onCLick="GAME.pause()"></td>'
    +'</tr></table></form>'

  buf+='<pre>';
  for (var i=0;i<boardHeight;i++) {
    for (var j=0;j<boardWidth;j++) {
      buf+='<img name="s'+i+'_'+j+'" src="s'+Math.abs(f[i][j])+'.gif" width=16 height=16 border=0>'; 
    }
    buf+='<img src="g.gif" width=1 height=16><br/>';
  }
  buf+='<img src="g.gif" width='+(boardWidth*16+1)+' height=1></pre></center>';
  document.getElementById("board").innerHTML=buf;
})()
