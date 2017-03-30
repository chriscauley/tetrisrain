function keyDown() { return false; /* placeholder */ }
function keyUp()   { return false; /* placeholder */ }
function init() {
 document.onkeydown = top.keyDown;
 document.onkeyup   = top.keyUp;
}

//-->
</script>
</head>

<body bgcolor="#FFFFFF" onLoad="init()">
<a name="#s"></a>

<script language="JavaScript">
<!--
buf='<center><form name=form1><table border=0 cellspacing=3 cellpadding=3><tr>'
+'<td><font face="Arial,Helvetica,sans-serif" size=2 point-size=10'
+'><nobr>Level:</font>&nbsp;<select name=s1 onchange="top.getLevel();this.blur();">'
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

+'<td><input type=button value="Start" onCLick="top.start()"></td>'
+'<td><input type=button value="Pause" onCLick="top.pause()"></td>'
+'</tr></table></form>'

buf+='<pre';
for (i=0;i<top.boardHeight;i++) {
 for (j=0;j<top.boardWidth;j++) {
  buf+='\n><a href="#s" onclick="if(top.ie4)this.blur();top.clk('+i+','+j+');return false;"'
      +'><img name="s'+i+'_'+j+'" src="s'+Math.abs(top.f[i][j])+'.gif" width=16 height=16 border=0></a'; 
 }
 buf+='\n><img src="g.gif" width=1 height=16><br';
}
buf+='\n><img src="g.gif" width='+(top.boardWidth*16+1)+' height=1></pre></center>';
document.writeln(buf);

top.boardLoaded=1;
